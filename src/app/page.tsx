"use client";

import { useState } from "react";
import type {
  FlowStep,
  IdeasResponse,
  MentorMessage,
  MentorResponse,
  ProjectDeepDive,
  ProjectIdea,
  RequestState,
  RoadmapResponse,
  StudentProfile,
} from "@/types";
import { postJson } from "@/lib/api-client";
import { MAX_MENTOR_HISTORY } from "@/lib/constants";
import { StepIndicator } from "@/components/StepIndicator";
import { ProjectForm } from "@/components/ProjectForm";
import { IdeaList } from "@/components/IdeaList";
import { DeepDiveSection } from "@/components/DeepDiveSection";
import { RoadmapSection } from "@/components/RoadmapSection";
import { MentorChat } from "@/components/MentorChat";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Card } from "@/components/ui/Card";

type Status = RequestState<unknown>["status"];

/** Derives which step of the flow to highlight from the three section states. */
function computeCurrentStep(ideas: Status, deepDive: Status, roadmap: Status): FlowStep {
  if (roadmap === "success") return "mentor";
  if (roadmap !== "idle") return "roadmap";
  if (deepDive !== "idle") return "deepDive";
  if (ideas !== "idle") return "ideas";
  return "profile";
}

/**
 * Orchestrates the single-page flow: profile -> ideas -> deep dive -> roadmap
 * -> mentor chat. Each step's fetch logic lives here; presentational
 * components stay focused on rendering their slice of state.
 */
export default function Home() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [ideasState, setIdeasState] = useState<RequestState<IdeasResponse>>({ status: "idle" });

  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null);
  const [deepDiveState, setDeepDiveState] = useState<RequestState<ProjectDeepDive>>({
    status: "idle",
  });

  const [roadmapState, setRoadmapState] = useState<RequestState<RoadmapResponse>>({
    status: "idle",
  });

  const [mentorMessages, setMentorMessages] = useState<MentorMessage[]>([]);
  const [isAskingMentor, setIsAskingMentor] = useState(false);
  const [mentorError, setMentorError] = useState<string | null>(null);

  const currentStep: FlowStep = computeCurrentStep(ideasState.status, deepDiveState.status, roadmapState.status);

  async function handleProfileSubmit(submittedProfile: StudentProfile) {
    setProfile(submittedProfile);
    setIdeasState({ status: "loading" });
    setDeepDiveState({ status: "idle" });
    setRoadmapState({ status: "idle" });
    setSelectedIdea(null);
    setMentorMessages([]);

    try {
      const data = await postJson<StudentProfile, IdeasResponse>("/api/ideas", submittedProfile);
      setIdeasState({ status: "success", data });
    } catch (err) {
      setIdeasState({ status: "error", message: (err as Error).message });
    }
  }

  async function handleSelectIdea(idea: ProjectIdea) {
    if (!profile) return;
    setSelectedIdea(idea);
    setDeepDiveState({ status: "loading" });

    try {
      const data = await postJson<{ profile: StudentProfile; idea: ProjectIdea }, ProjectDeepDive>(
        "/api/deep-dive",
        { profile, idea },
      );
      setDeepDiveState({ status: "success", data });
    } catch (err) {
      setDeepDiveState({ status: "error", message: (err as Error).message });
    }
  }

  async function handleGenerateRoadmap() {
    if (!profile || !selectedIdea || deepDiveState.status !== "success") return;
    setRoadmapState({ status: "loading" });

    try {
      const data = await postJson<
        { profile: StudentProfile; idea: ProjectIdea; deepDive: ProjectDeepDive },
        RoadmapResponse
      >("/api/roadmap", { profile, idea: selectedIdea, deepDive: deepDiveState.data });
      setRoadmapState({ status: "success", data });
    } catch (err) {
      setRoadmapState({ status: "error", message: (err as Error).message });
    }
  }

  async function handleAskMentor(question: string) {
    if (!profile || !selectedIdea) return;
    const nextHistory = [...mentorMessages, { role: "user", content: question } as MentorMessage];
    setMentorMessages(nextHistory);
    setIsAskingMentor(true);
    setMentorError(null);

    try {
      const data = await postJson<
        { profile: StudentProfile; idea: ProjectIdea; history: MentorMessage[]; question: string },
        MentorResponse
      >("/api/mentor", {
        profile,
        idea: selectedIdea,
        history: mentorMessages.slice(-MAX_MENTOR_HISTORY),
        question,
      });

      const reply = [data.answer, ...(data.recommendations ?? []).map((r) => `- ${r}`)].join("\n");
      setMentorMessages([...nextHistory, { role: "assistant", content: reply }]);
    } catch (err) {
      setMentorError((err as Error).message);
    } finally {
      setIsAskingMentor(false);
    }
  }

  return (
    <main className="bg-blueprint bg-grid min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8 border-b-2 border-navy pb-6">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-accent-dark">
            Final-Year Project Mentor
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold text-ink sm:text-3xl">
            Plan, build, and defend your final-year project
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-navy/70">
            Tell us about your branch, skills, and timeline. We&apos;ll draft project ideas, break
            one down into a build plan, and stay on hand as your mentor.
          </p>
        </header>

        <div className="mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        <div className="space-y-8">
          <section aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="font-display mb-3 text-lg font-semibold text-ink">
              1. Your profile
            </h2>
            <Card>
              <ProjectForm onSubmit={handleProfileSubmit} isSubmitting={ideasState.status === "loading"} />
            </Card>
          </section>

          {ideasState.status !== "idle" && (
            <section aria-labelledby="ideas-heading">
              <h2 id="ideas-heading" className="font-display mb-3 text-lg font-semibold text-ink">
                2. Choose a project idea
              </h2>
              {ideasState.status === "loading" && (
                <Card>
                  <LoadingState label="Drafting three project ideas for your profile..." />
                </Card>
              )}
              {ideasState.status === "error" && (
                <ErrorState
                  message={ideasState.message}
                  onRetry={() => profile && handleProfileSubmit(profile)}
                />
              )}
              {ideasState.status === "success" && (
                <IdeaList
                  ideas={ideasState.data.ideas}
                  onSelect={handleSelectIdea}
                  selectingTitle={deepDiveState.status === "loading" ? selectedIdea?.title ?? null : null}
                />
              )}
            </section>
          )}

          {deepDiveState.status !== "idle" && (
            <section aria-labelledby="deepdive-heading">
              <h2 id="deepdive-heading" className="font-display mb-3 text-lg font-semibold text-ink">
                3. Project deep dive{selectedIdea ? `: ${selectedIdea.title}` : ""}
              </h2>
              {deepDiveState.status === "loading" && (
                <Card>
                  <LoadingState label="Working out features, architecture, and steps..." skeletonRows={5} />
                </Card>
              )}
              {deepDiveState.status === "error" && (
                <ErrorState
                  message={deepDiveState.message}
                  onRetry={() => selectedIdea && handleSelectIdea(selectedIdea)}
                />
              )}
              {deepDiveState.status === "success" && (
                <DeepDiveSection
                  deepDive={deepDiveState.data}
                  onContinue={handleGenerateRoadmap}
                  isContinuing={roadmapState.status === "loading"}
                />
              )}
            </section>
          )}

          {roadmapState.status !== "idle" && (
            <section aria-labelledby="roadmap-heading">
              <h2 id="roadmap-heading" className="font-display mb-3 text-lg font-semibold text-ink">
                4. Weekly roadmap
              </h2>
              {roadmapState.status === "loading" && (
                <Card>
                  <LoadingState label="Laying out your week-by-week plan..." skeletonRows={4} />
                </Card>
              )}
              {roadmapState.status === "error" && (
                <ErrorState message={roadmapState.message} onRetry={handleGenerateRoadmap} />
              )}
              {roadmapState.status === "success" && (
                <RoadmapSection
                  roadmap={roadmapState.data}
                  onContinue={() => {
                    document.getElementById("mentor-heading")?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              )}
            </section>
          )}

          {roadmapState.status === "success" && (
            <section aria-labelledby="mentor-heading">
              <h2 id="mentor-heading" className="font-display mb-3 text-lg font-semibold text-ink">
                5. AI mentor chat
              </h2>
              <Card>
                <MentorChat messages={mentorMessages} onAsk={handleAskMentor} isAsking={isAskingMentor} />
                {mentorError && (
                  <div className="mt-3">
                    <ErrorState message={mentorError} />
                  </div>
                )}
              </Card>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";
import { ChallengeMatch, QuizQuestion } from "@/lib/types/student-types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, topic = "Database Normalization & Deadlocks", answers, challengeId } = body;

    // Action 1: Evaluate submitted challenge answers
    if (action === "submit" && Array.isArray(answers)) {
      let studentScore = 0;
      const totalQuestions = answers.length;

      answers.forEach((ans: { questionIndex: number; selectedOption: number; correctOption: number }) => {
        if (ans.selectedOption === ans.correctOption) {
          studentScore += 1;
        }
      });

      const aiScore = Math.min(totalQuestions, studentScore + (Math.random() > 0.5 ? 1 : 0));
      const percentage = (studentScore / totalQuestions) * 100;

      const strongTopics = percentage >= 80 
        ? ["1NF Atomicity", "2NF Partial Dependency", "Deadlock Wound-Wait"]
        : percentage >= 60
        ? ["1NF Atomicity", "2NF Partial Dependency"]
        : ["1NF Fundamentals"];

      const weakTopics = percentage < 100
        ? ["3NF Transitive Dependency", "BCNF Determinants", "Deadlock Wait-Die Scheme"]
        : [];

      const matchResult: ChallengeMatch = {
        id: challengeId || `match_${Date.now()}`,
        topic,
        question: "AI Se Baazi Match Completed",
        options: [],
        correctOptionIndex: 0,
        aiAnswerIndex: 0,
        aiExplanation: `Student scored ${studentScore}/${totalQuestions}. AI scored ${aiScore}/${totalQuestions}.`,
        studentScore,
        aiScore,
        xpEarned: studentScore * 40 + 50
      };

      serverState.addChallengeMatch(matchResult);

      return NextResponse.json({
        success: true,
        result: {
          studentScore,
          aiScore,
          totalQuestions,
          percentage,
          xpEarned: matchResult.xpEarned,
          strongTopics,
          weakTopics
        }
      });
    }

    // Action 2: Generate fresh AI Se Baazi challenge questions
    const questions: QuizQuestion[] = [
      {
        id: "ch_1",
        question: "Which Normal Form strictly eliminates Partial Functional Dependencies?",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correctOptionIndex: 1,
        explanation: "2NF requires that every non-prime attribute is fully functionally dependent on the entire primary key, eliminating partial dependencies."
      },
      {
        id: "ch_2",
        question: "In 3NF, what condition must hold for every non-trivial functional dependency X -> Y?",
        options: [
          "X must be a super key or Y must be a prime attribute",
          "X and Y must both be prime attributes",
          "X must be a candidate key and Y must be atomic",
          "Y must be dependent on partial keys"
        ],
        correctOptionIndex: 0,
        explanation: "3NF allows X -> Y if X is a super key or Y is part of a candidate key (prime attribute), preventing transitive dependencies."
      },
      {
        id: "ch_3",
        question: "Which deadlock handling scheme aborts younger transactions when a older transaction requests a lock?",
        options: ["Wait-Die Scheme", "Wound-Wait Scheme", "Banker's Algorithm", "Strict 2PL"],
        correctOptionIndex: 1,
        explanation: "In Wound-Wait, an older transaction wounds (aborts) a younger transaction holding the lock, ensuring non-preemptive ordering."
      },
      {
        id: "ch_4",
        question: "What is the primary constraint of Boyce-Codd Normal Form (BCNF) compared to 3NF?",
        options: [
          "For every non-trivial FD X -> Y, X MUST be a super key",
          "BCNF allows multi-valued dependencies",
          "BCNF permits transitive dependencies on non-prime attributes",
          "BCNF requires all domain values to be compound tuples"
        ],
        correctOptionIndex: 0,
        explanation: "BCNF is a stricter form of 3NF where X must be a super key for every functional dependency X -> Y without exception."
      },
      {
        id: "ch_5",
        question: "What type of lock permits multiple transactions to read a database item simultaneously?",
        options: ["Exclusive Lock (X)", "Shared Lock (S)", "Intent Lock (IX)", "Update Lock (U)"],
        correctOptionIndex: 1,
        explanation: "Shared locks (S) allow multiple concurrent read operations on the same data item."
      }
    ];

    return NextResponse.json({
      success: true,
      challengeId: `ch_${Date.now()}`,
      topic,
      questions
    });
  } catch (error) {
    console.error("Error in /api/challenge route:", error);
    return NextResponse.json(
      { error: "Couldn't launch AI Se Baazi challenge. Please try again." },
      { status: 500 }
    );
  }
}

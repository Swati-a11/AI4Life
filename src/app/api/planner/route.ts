import { NextRequest, NextResponse } from "next/server";
import { serverState, UserStudyPlan, StudyGoal, PlannerTask } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";
import { CreditService } from "@/lib/services/credit-service";

export async function GET(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const plan = serverState.getUserStudyPlan(userId);

    return NextResponse.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error("Error fetching study plan:", error);
    return NextResponse.json({ error: "Failed to fetch study plan." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const body = await req.json();
    const { action, goals, availableDailyHours = 4, dateRange = "Today", taskId, status, targetDate, newDailyHours } = body;

    // ACTION 1: UPDATE TASK STATUS (e.g. Completed, Rescheduled, Skipped)
    if (action === "update_task" && taskId && status) {
      const result = serverState.updatePlannerTaskStatus(userId, taskId, status, targetDate);
      return NextResponse.json({
        success: true,
        plan: result.plan,
        progress: result.progress
      });
    }

    // ACTION 2: REBALANCE PLAN ACCORDING TO NEW DAILY HOURS
    if (action === "rebalance" && newDailyHours) {
      const rebalanced = serverState.rebalanceUserPlan(userId, Number(newDailyHours));
      return NextResponse.json({
        success: true,
        plan: rebalanced
      });
    }

    // ACTION 3: GENERATE FRESH REALISTIC STUDY PLAN
    const idKey = `plan_${Date.now()}`;
    const deduction = CreditService.deductCredits(20, userId, idKey, "Study Plan Generation");
    if (!deduction.success) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INSUFFICIENT_CREDITS",
          error: "You need 20 credits to generate a study plan."
        },
        { status: 400 }
      );
    }

    const parsedGoals: StudyGoal[] = Array.isArray(goals) && goals.length > 0
      ? goals.map((g: any, idx: number) => ({
          id: g.id || `g_${Date.now()}_${idx}`,
          userId,
          title: g.title || `Goal ${idx + 1}`,
          description: g.description || "",
          priority: g.priority || "High",
          targetDate: g.targetDate || "",
          estimatedHours: g.estimatedHours || 2
        }))
      : [
          { id: `g_1_${Date.now()}`, userId, title: "AI4Life Project", priority: "High", estimatedHours: 2 },
          { id: `g_2_${Date.now()}`, userId, title: "DSA", priority: "Medium", estimatedHours: 1 },
          { id: `g_3_${Date.now()}`, userId, title: "JavaScript", priority: "Medium", estimatedHours: 1 }
        ];

    const dailyLimitHours = Math.max(1, Math.min(12, Number(availableDailyHours) || 4));
    const maxMinutesPerDay = dailyLimitHours * 60;

    const daysCount = dateRange === "1 Week" ? 7 : dateRange === "3 Days" ? 3 : 1;
    const generatedTasks: PlannerTask[] = [];

    let currentStartHour = 9; // 09:00 AM start time

    for (let d = 0; d < daysCount; d++) {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + d);
      const dateStr = dateObj.toISOString().split("T")[0];
      const dayLabel = d === 0 ? "Today" : d === 1 ? "Tomorrow" : `Day ${d + 1}`;

      let allocatedMinutesToday = 0;
      let startMins = 9 * 60; // 09:00 AM

      for (let i = 0; i < parsedGoals.length; i++) {
        const goal = parsedGoals[i];
        if (allocatedMinutesToday >= maxMinutesPerDay) break;

        // Determine actionable task duration (max 120 mins per block)
        const totalRemainingBudget = maxMinutesPerDay - allocatedMinutesToday;
        const taskDurationMins = Math.min(120, Math.min(60, totalRemainingBudget));

        if (taskDurationMins <= 0) break;

        const startHour = Math.floor(startMins / 60);
        const startMinute = startMins % 60;
        const endMins = startMins + taskDurationMins;
        const endHour = Math.floor(endMins / 60);
        const endMinute = endMins % 60;

        const startTimeStr = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
        const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

        // Actionable concrete task title
        let actionTitle = `Practice ${goal.title} core concepts`;
        if (goal.title.toLowerCase().includes("dsa")) actionTitle = "Practice 2 Binary Search problems";
        else if (goal.title.toLowerCase().includes("ai4life")) actionTitle = "Implement Study Planner goal input & persistence";
        else if (goal.title.toLowerCase().includes("javascript")) actionTitle = "JavaScript Async/Await practice exercises";
        else if (goal.title.toLowerCase().includes("interview") || goal.title.toLowerCase().includes("sde")) actionTitle = "Solve 2 SDE System Design mock problems";

        generatedTasks.push({
          id: `t_${Date.now()}_${d}_${i}`,
          userId,
          goalId: goal.id,
          date: dateStr,
          dayLabel,
          startTime: startTimeStr,
          endTime: endTimeStr,
          durationMinutes: taskDurationMins,
          goalTitle: goal.title,
          title: actionTitle,
          description: `Focused ${taskDurationMins}-minute session on ${goal.title}`,
          priority: goal.priority,
          status: "pending",
          completed: false
        });

        allocatedMinutesToday += taskDurationMins;
        // 15-minute break (not counted towards study time)
        startMins = endMins + 15;
      }
    }

    const newPlan: UserStudyPlan = {
      id: `plan_${Date.now()}`,
      userId,
      dateRange: dateRange as any,
      availableDailyHours: dailyLimitHours,
      goals: parsedGoals,
      tasks: generatedTasks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedPlan = serverState.saveUserStudyPlan(userId, newPlan);

    return NextResponse.json({
      success: true,
      plan: savedPlan
    });
  } catch (error) {
    console.error("Error generating study plan:", error);
    return NextResponse.json({ error: "Failed to generate study plan." }, { status: 500 });
  }
}

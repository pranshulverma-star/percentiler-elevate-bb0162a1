/**
 * nudge-engine/messages.ts
 *
 * All copy variants for every nudge type.
 * Variants are 0-indexed to match the variant_index column in DB.
 * Each nudge type has exactly 4 variants.
 *
 * Runtime variable substitution tokens:
 *   {name}   → user's display name
 *   {streak} → consecutive-day streak count (STREAK_ABOUT_TO_BREAK only)
 *
 * To pick a variant:
 *   getVariant("NO_FLASHCARDS_TODAY", variantIndex)
 *
 * Do NOT use ${} template expressions here — {name} and {streak} are
 * plain string tokens replaced at runtime by the nudge engine.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Push + in-app copy. Used by nudges that do not send email. */
export interface BaseVariant {
  pushTitle: string;
  pushBody: string;
  inAppTitle: string;
  inAppBody: string;
}

/** Push + in-app + email copy. Used by nudges that also send email. */
export interface EmailVariant extends BaseVariant {
  emailSubject: string;
  emailBody: string;
}

export type AnyVariant = BaseVariant | EmailVariant;
export type NudgeMessageKey = keyof typeof MESSAGES;

// ─── Messages ─────────────────────────────────────────────────────────────────

export const MESSAGES = {

  // ── NO_FLASHCARDS_TODAY (4 variants) ───────────────────────────────────────

  NO_FLASHCARDS_TODAY: [
    {
      pushTitle: "You studied zero cards today. ZERO. 💀",
      pushBody:
        "{name} a CAT aspirant. Woke up. Had a whole day. Reviewed exactly zero flashcards. The IIMs are shaking with fear I'm sure.",
      inAppTitle: "Zero cards. A whole day. Gone.",
      inAppBody:
        "You had 24 hours and reviewed zero flashcards. Your competitor used 20 minutes of theirs and locked in 3 new concepts. The gap just got a little wider. Fix it before midnight.",
    },
    {
      pushTitle: "The flashcards filed a missing person report 🚨",
      pushBody:
        "{name} your flashcards haven't seen you all day. They're worried. They're asking questions. Mostly 'why does {name} hate us.' Please come back.",
      inAppTitle: "Your flashcards are genuinely concerned",
      inAppBody:
        "Hasn't been seen all day. Last known location: the dashboard. If found, please return to flashcard review immediately. The 99%ile cannot wait.",
    },
    {
      pushTitle: "Skipped flashcards. Chose vibes. Interesting. 😶",
      pushBody:
        "{name} the toppers reviewing cards rn will not remember this moment. But the exam hall will. Every blank stare at a concept you skipped today — that's this moment haunting you.",
      inAppTitle: "Today's skipped card = exam hall blank stare",
      inAppBody:
        "Every concept you skip in practice shows up exactly once more — in the exam. The toppers reviewed their cards today. You didn't. There's still tonight. Use it.",
    },
    {
      pushTitle: "Your competitor just finished their 3rd session 😭",
      pushBody:
        "{name} while you were doing literally anything else, someone who wants the same IIM seat as you just finished their third flashcard session today. Third. How many did you do?",
      inAppTitle: "They did 3 sessions. You did 0. Today.",
      inAppBody:
        "Someone who wants your IIM seat did three flashcard sessions today. You did zero. The leaderboard isn't wrong — it's just honest. 10 minutes right now changes this.",
    },
  ] satisfies BaseVariant[],

  // ── NO_SPRINT_GOAL_THIS_WEEK (4 variants) ──────────────────────────────────

  NO_SPRINT_GOAL_THIS_WEEK: [
    {
      pushTitle: "No goals. Whole week. Manifesting IIM? 🧿",
      pushBody:
        "{name} babe the IIMs don't accept vision boards. They accept 99 percentilers. And 99 percentilers have goals. Written down. Every week. Unlike some people.",
      inAppTitle: "Manifesting IIM without goals. Bold.",
      inAppBody:
        "The IIMs don't accept vision boards. They accept 99 percentilers with plans. Every topper on this leaderboard set goals this week. You're out here freestyling CAT 2026. 30 seconds. Fix it.",
    },
    {
      pushTitle: "Winging CAT 2026 is not the move {name} 😬",
      pushBody:
        "{name} no sprint goal means you're navigating CAT prep with zero GPS. The toppers have a plan for every single day. You're just vibing in the general direction of IIM. Set a goal.",
      inAppTitle: "Vibing in the general direction of IIM",
      inAppBody:
        "No goal = no direction = no percentile growth. The toppers don't wing it. They plan it. You're 30 seconds away from having a goal for this week. The leaderboard rewards people who show up with a plan. Be one of them.",
    },
    {
      pushTitle: "Everyone planned their week. You said nah. 💅",
      pushBody:
        "{name} your competitors opened the app, set their goals, and got to work. You opened the app and then... nothing. The gap between you and the leaderboard top is exactly this wide.",
      inAppTitle: "They planned. You said nah. The gap grew.",
      inAppBody:
        "This week everyone above you on the leaderboard set goals and executed them. You started the week on autopilot. The good news — it's not over yet. 30 seconds. One goal. Change the whole week.",
    },
    {
      pushTitle: "The leaderboard gap has a name. It's called no goals. 📉",
      pushBody:
        "{name} ever wonder why some people just keep climbing the leaderboard every week? Spoiler: it's not talent. It's a sprint goal. Set. Every. Week. You're one tap away from being that person.",
      inAppTitle: "The leaderboard gap is literally just this",
      inAppBody:
        "The people climbing the leaderboard every week aren't smarter than you. They just set goals and show up. That's the whole secret. You're one sprint goal away from being one of them. Set it now.",
    },
  ] satisfies BaseVariant[],

  // ── STREAK_ABOUT_TO_BREAK (4 variants) ─────────────────────────────────────

  STREAK_ABOUT_TO_BREAK: [
    {
      pushTitle: "{streak} days. Midnight. One session. Choose. ⏳",
      pushBody:
        "{name} I am physically holding your streak hostage until you open this app. {streak} days of discipline. Do NOT let it die tonight because you were tired. Tired doesn't get into IIM.",
      inAppTitle: "{streak} days held hostage until midnight",
      inAppBody:
        "{streak} days of showing up every single day. Tonight it dies if you don't act. The reset is permanent. The regret is longer. One session keeps everything alive. Do it.",
      emailSubject: "{name}, your {streak}-day streak dies at midnight. No cap.",
      emailBody:
`{name}, let's not dress this up.

You have a {streak}-day streak. That means you chose studying over everything else for {streak} days straight. That's not easy. Most people on this app have never hit that number.

And tonight you're going to throw it all away because you're tired?

Here's what happens at midnight if you don't study: the counter goes to zero. The momentum breaks. The habit loop shatters. And statistically, most people who lose a streak at this length never rebuild it.

One session. 15 minutes. That's the price of keeping {streak} days of work alive.

Pay it. Open the app. Study something. Anything.

Your streak — and the version of you that built it — is worth more than this.`,
    },
    {
      pushTitle: "Bro is really about to fumble a {streak} day streak 😭",
      pushBody:
        "{name} future you is watching this moment from an IIM classroom and CRYING. {streak} days. You were SO consistent. Don't let tonight be the plot twist nobody asked for.",
      inAppTitle: "Future IIM you is watching. And crying.",
      inAppBody:
        "{streak} days of being the most consistent version of yourself. Tonight future you — the one sitting in an IIM classroom — is watching to see if you hold. Don't give them a reason to cringe. Study. Now.",
      emailSubject: "{name}, future you is watching this moment from IIM. Don't fumble it.",
      emailBody:
`{name}, close your eyes for a second.

Imagine future you. IIM campus. First year. Looking back at the journey that got them there.

Now imagine they're watching tonight. Right now. Watching to see if you protect a {streak}-day streak or let it die because you couldn't find 15 minutes.

What do you want them to see?

{streak} days is not an accident. It's character. It's the kind of consistency that gets people into rooms they were told they couldn't enter.

Protect it tonight. One session. That's all future you is asking for.

Don't fumble the streak. Don't fumble the dream.`,
    },
    {
      pushTitle: "The streak reset notification is literally loading... 🔄",
      pushBody:
        "{name} I can see the reset preparing itself. It's warming up. Stretching. Ready to wipe out {streak} days in one move. You have hours to stop it. Will you?",
      inAppTitle: "The streak reset is literally loading rn",
      inAppBody:
        "It's warming up. Ready to wipe {streak} days clean at midnight. Your competitors are hoping you don't notice in time. Open the app. Study something. Cancel the reset.",
      emailSubject: "{name}, the {streak}-day streak reset is scheduled for tonight. Cancel it.",
      emailBody:
`{name}, here's what's happening on our end right now.

The streak reset is scheduled. Midnight. {streak} days → zero.

Unless you cancel it.

And cancelling it is embarrassingly simple: open the app, study for 15 minutes, done. The reset gets cancelled. The streak survives. Day {streak} becomes day {streak}+1.

Here's what the reset actually costs you: the momentum you built over {streak} days. The habit that's starting to feel automatic. The leaderboard position that came with consistent studying.

All of it. Gone. For the price of not studying tonight.

The reset is loading. You can still stop it.

Will you?`,
    },
    {
      pushTitle: "{streak} days vs 1 lazy evening. Don't. 😤",
      pushBody:
        "{name} the entire leaderboard knows your streak. They've been watching. Some of them are rooting for you. Some of them are waiting for you to slip. Don't give the wrong ones the satisfaction.",
      inAppTitle: "The leaderboard is watching your streak rn",
      inAppBody:
        "Everyone on the leaderboard can see your {streak}-day streak. Some are rooting for you. Some are waiting for you to slip. Don't give the wrong ones the satisfaction tonight. Study. Keep it alive.",
      emailSubject: "{name}, the leaderboard is watching your {streak}-day streak tonight",
      emailBody:
`{name}, real talk — your {streak}-day streak is visible to everyone on the Percentilers leaderboard.

Some of them are rooting for you. They've watched the number climb and they respect the consistency.

Some of them are waiting. Quietly hoping you slip up tonight so they can close the gap.

Right now, tonight, you get to decide which group gets what they want.

A {streak}-day streak doesn't just represent consistency — it represents a competitive advantage. Every day it survives, it signals to the leaderboard that you're serious. That you show up. That you don't quit.

One session. Tonight. Keep the streak. Keep the signal.

Don't give the wrong people the satisfaction.`,
    },
  ] satisfies EmailVariant[],

  // ── NOT_LOGGED_IN_3_DAYS (4 variants) ──────────────────────────────────────

  NOT_LOGGED_IN_3_DAYS: [
    {
      pushTitle: "3 days offline. 47 people passed you. Casually. 📉",
      pushBody:
        "{name} while you were out, the Percentilers leaderboard had an entire era. New mocks. New streaks. New rankings. You missed the whole thing. Come see the damage.",
      inAppTitle: "You missed a whole era on the leaderboard",
      inAppBody:
        "3 days away. New mocks dropped. Streaks grew. 47 people climbed past your rank while you were gone. The gap is real but it's closeable — if you start today. Not tomorrow. Today.",
      emailSubject: "{name}, 47 people passed you while you were gone. Let's fix that.",
      emailBody:
`{name}, we're not going to sugarcoat this.

It's been 3 days. And in those 3 days the Percentilers leaderboard moved — a lot.

People did full mocks at midnight. Reviewed flashcards before breakfast. Hit sprint goals you set but never touched. Built streaks while yours was dying.

And your rank? It took a hit.

But here's the thing about a 3-day gap: it's nothing. It's completely closeable. The people who passed you aren't untouchable — they just showed up while you didn't.

Today you can start showing up again.

Your dashboard is exactly where you left it. Your study plan remembers you. The leaderboard is waiting.

Come back. Close the gap. Show them who actually belongs at the top.`,
    },
    {
      pushTitle: "3 days. That's a lot of mocks you didn't take. 😶",
      pushBody:
        "{name} your competitors spent 3 days grinding mocks, flashcards and sprint goals. You spent 3 days doing literally anything else. The leaderboard is a mirror. Come look.",
      inAppTitle: "3 days of grinding you didn't do",
      inAppBody:
        "Your competitors spent 3 days taking mocks, reviewing cards and setting goals. Every hour they used was an hour you gave away. The leaderboard reflects it. But today is a new day — if you choose to use it.",
      emailSubject: "{name}, your competitors had a very productive 3 days. Did you?",
      emailBody:
`{name}, let's look at what the last 3 days looked like for the people chasing your IIM seat.

Day 1: Full mock test. 3-hour review session.
Day 2: Flashcard marathon. Sprint goal set and completed.
Day 3: DILR deep dive. Leaderboard position gained.

And your last 3 days?

We're not judging — life is complicated. But CAT prep doesn't pause because life got busy.

The good news is you're still in this. The gap is real but it's not permanent. One session today starts the comeback.

Your dashboard is ready. Your planner is waiting. The leaderboard has a spot with your name on it — but someone else is sitting in it right now.

Come take it back.`,
    },
    {
      pushTitle: "Bro really said 'I'll prep tomorrow' for 3 days 💀",
      pushBody:
        "{name} Day 1: I'll study tomorrow. Day 2: Tomorrow for sure. Day 3: okay actually tomorrow. Tomorrow is today. We're not doing this again. Open the app.",
      inAppTitle: "Tomorrow became 3 tomorrows. It stops now.",
      inAppBody:
        "'I'll study tomorrow' said three days in a row. Tomorrow is today. The cycle ends here. Open the dashboard, pick one thing, do it. That's the whole task. Go.",
      emailSubject: "{name}, 'I'll study tomorrow' has been said 3 days in a row. Today is the day.",
      emailBody:
`{name}, be honest with yourself for a second.

Day 1: 'I'll get back to it tomorrow.'
Day 2: 'Tomorrow for sure.'
Day 3: 'Okay, tomorrow. Final answer.'

We've all been there. The tomorrow trap is real and it's sneaky because it always feels reasonable in the moment.

But here's what the tomorrow trap actually costs you: compounding lost time. Every day you postpone, the gap widens a little more. The habit weakens a little more. The comeback feels a little harder.

Today you break the cycle.

Not with a massive 6-hour session. Not with some grand comeback plan. Just one thing. Open the app. Review some flashcards. Set a sprint goal. Take a practice quiz.

One thing today. That's it. That's the whole ask.

Tomorrow starts now.`,
    },
    {
      pushTitle: "Your study plan is collecting cobwebs rn 🕸️",
      pushBody:
        "{name} your planner. Your flashcards. Your sprint goals. All fully ghosted for 72 hours. They're not mad. They're just... disappointed. Come back and make it right.",
      inAppTitle: "Fully ghosted your study plan for 72 hours",
      inAppBody:
        "Your planner. Your flashcards. Your sprint goals. All sitting there, ghosted, for 3 days straight. They're not angry — just disappointed. Come back today. Make it right. The whole dashboard is exactly where you left it.",
      emailSubject: "{name}, your entire study plan has been ghosted for 3 days",
      emailBody:
`{name}, we're just going to say it.

You ghosted us.

Not in a dramatic way. Just the quiet, slow ghost — where you meant to come back, kept meaning to come back, and suddenly it's been 3 days.

Your planner? Untouched. Your flashcards? Waiting. Your sprint goals? Still sitting there from before you left, patiently hoping today's the day.

Here's the thing about ghosting your prep: it doesn't affect the exam date. CAT 2026 is still happening. The IIM seats are still competitive. The other aspirants are still grinding.

But it does affect you — your momentum, your rank, your confidence.

Come back today. Not with a grand plan. Just come back.

Open the app. Do one thing. Let that be enough for today.

We'll take it from there together.`,
    },
  ] satisfies EmailVariant[],

  // ── NOT_LOGGED_IN_7_DAYS (4 variants) ──────────────────────────────────────

  NOT_LOGGED_IN_7_DAYS: [
    {
      pushTitle: "7 days offline. A whole week. We're in our flop era 💀",
      pushBody:
        "{name} SEVEN days. The toppers did 7 mocks, 200 flashcards and climbed the entire leaderboard while you were away living your best life. CAT said 'noted.'",
      inAppTitle: "A whole flop era. 7 days. CAT noted.",
      inAppBody:
        "7 days offline. The toppers did 7 mocks and 200 flashcards. The leaderboard is unrecognisable from when you left. Your dashboard is still here though — ready for the comeback arc to begin. Today.",
      emailSubject: "{name}, 7 days offline. The toppers didn't take the week off. Let's talk.",
      emailBody:
`{name}. Sit down. We need to have a real conversation.

It has been SEVEN DAYS.

Seven days of CAT prep time. Gone.

Do you know what the toppers on Percentilers did with those 7 days? They took full-length mocks. They reviewed every single mistake until it became a strength. They drilled flashcards until concepts were automatic. They set sprint goals, hit them, and went back for more.

And you? You vanished.

We're not here to make you feel bad — we're here because you signed up for this. You chose IIM. You chose 99 percentile. You chose to be the kind of person who does what it takes.

That person doesn't stay away for 7 days.

But they do come back.

Today is the day you come back. Not tomorrow. Not Monday. Today.

Your dashboard is exactly where you left it. Your study plan remembers you. The leaderboard has a gap with your name on it.

Close it. Start now.`,
    },
    {
      pushTitle: "168 hours of CAT prep. Donated to your competitors. 🫡",
      pushBody:
        "{name} a full week. 168 hours. Every single hour was a gift you gave your competitors. They used it. All of it. The leaderboard shows. Come see what a week of grinding looks like.",
      inAppTitle: "168 hours gifted to your competitors",
      inAppBody:
        "7 days. 168 hours of potential CAT prep handed directly to your competitors. They used every hour. The leaderboard reflects exactly how much. It's brutal — but it's not permanent. The comeback starts today.",
      emailSubject: "{name}, you donated 168 hours of CAT prep to your competitors",
      emailBody:
`{name}, let's do the uncomfortable math.

7 days × 24 hours = 168 hours of CAT prep time.

Hours you were offline. Hours your competitors were not.

In 168 hours, the most dedicated aspirants on Percentilers completed multiple full mock tests with detailed reviews, hundreds of flashcard repetitions, every sprint goal they set, and climbed significantly on the leaderboard.

Every single one of those hours was an advantage you handed them for free.

Now here's the part that matters: it's not too late.

168 hours sounds like a lot. But CAT 2026 is still months away. The gap is real but it's completely closeable — if you start today.

Not with a heroic 10-hour session. Just with one decision: open the app, do something, don't stop.

The comeback begins with that one decision.

Make it today.`,
    },
    {
      pushTitle: "Your IIM seat is getting comfortable without you 👀",
      pushBody:
        "{name} while you were gone, someone else has been working for the IIM seat you want. They don't know you exist. They're just grinding. Every. Single. Day. Are you coming back or nah?",
      inAppTitle: "Someone else is working for your IIM seat",
      inAppBody:
        "They don't know you exist. They're just grinding every single day for the same IIM seat you want. 7 days you weren't competing. 7 days they were. The seat doesn't wait. Come back and fight for it.",
      emailSubject: "{name}, someone is working for your IIM seat. They've had a 7 day head start.",
      emailBody:
`{name}, there's something you should know.

Somewhere out there, right now, is a person who wants exactly what you want. The same IIM. The same percentile. The same future.

They don't know you exist. They're not thinking about you. They're just grinding — flashcards, mocks, sprint goals — every single day.

While you've been offline for 7 days, they've had 7 days of uncontested prep time. 7 days of closing the gap between themselves and the IIM seat you both want.

This isn't meant to scare you. It's meant to wake you up.

Because you have something they might not: a full study system, a personalised planner, a leaderboard to compete on, and the self-awareness to know you need to get back.

Use it. Come back today.

The seat is still yours to fight for. But only if you start fighting.`,
    },
    {
      pushTitle: "The app has a {name}-shaped hole in it rn 🕳️",
      pushBody:
        "{name} a whole week of absence. Your streak died. Your rank fell. The leaderboard moved on. But your dashboard is still here, still yours, still ready for the most dramatic comeback of CAT 2026.",
      inAppTitle: "Time for the most dramatic comeback of CAT 2026",
      inAppBody:
        "A week away. Streak dead. Rank fallen. Leaderboard moved on without you. But your dashboard is still here. Still yours. Still ready. Every great comeback story needed a low point. This is yours. Start today.",
      emailSubject: "{name}, every comeback story needed a low point. This is yours.",
      emailBody:
`{name}, every great story has a moment where things looked impossible.

The hero was down. The odds were against them. Everyone had written them off.

And then they came back.

You've been away for 7 days. Your streak is gone. Your rank has slipped. The leaderboard moved on without you.

This is your low point.

But low points aren't endings — they're setups. Every person who ever cracked CAT with a 99+ percentile had a moment where they almost quit. Where the gap felt too big. Where coming back felt pointless.

The ones who made it came back anyway.

Your dashboard is exactly where you left it. Your study plan is ready. The leaderboard has room for a comeback story.

Write yours. Start today.

Because the version of you that walks into an IIM campus is the one who chose to open this app right now — not the one who waited for tomorrow.`,
    },
  ] satisfies EmailVariant[],

} as const;

// ─── Variant picker ───────────────────────────────────────────────────────────

/**
 * Pick a variant by explicit index (0–3).
 * Wraps around if variantIndex is out of bounds.
 * Use the variant_index value stored in the DB for deterministic, per-user selection.
 */
export function getVariant(
  nudgeType: NudgeMessageKey,
  variantIndex: number
): AnyVariant {
  const variants = MESSAGES[nudgeType] as readonly AnyVariant[];
  return variants[variantIndex % variants.length];
}

/**
 * Deterministically assign a variant index to a user based on their user_id.
 * Produces a stable 0–3 value for a given user so they always see the same
 * variant for a given nudge type.
 */
export function variantIndexForUser(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return hash % 4;
}

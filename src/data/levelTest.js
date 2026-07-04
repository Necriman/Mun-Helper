/**
 * Delegate level test — 10 questions covering rules of procedure, committee
 * flow and document work. Scoring (see supabase/leaderboard_and_test.sql):
 * ≥80% → Advanced, ≥50% → Intermediate, otherwise Rookie.
 */
export const LEVEL_TEST = [
  {
    q: 'What is a "motion" in a MUN committee?',
    options: [
      'A formal proposal to do something as a committee (e.g. open debate)',
      'A written complaint to the Secretary-General',
      'Any speech longer than one minute',
      'A vote on the final resolution only',
    ],
    correct: 0,
    why: 'Motions drive the committee: opening debate, setting the agenda, moving into caucuses — all are motions voted on by delegates.',
  },
  {
    q: 'What is the difference between a moderated and an unmoderated caucus?',
    options: [
      'Moderated has a speakers order run by the chair; unmoderated is free movement and negotiation',
      'Moderated is for crisis committees only',
      'Unmoderated requires a two-thirds majority to speak',
      'There is no difference, the names are interchangeable',
    ],
    correct: 0,
    why: 'In a moderated caucus the chair calls on speakers for timed remarks; in an unmoderated one delegates leave their seats and negotiate freely.',
  },
  {
    q: 'You believe the chair skipped your country in the speakers list. What do you rise to?',
    options: ['Point of Order', 'Point of Information', 'Right of Reply', 'Motion to Adjourn'],
    correct: 0,
    why: 'A Point of Order flags an error in parliamentary procedure — exactly what a skipped speakers-list entry is.',
  },
  {
    q: 'What is a Position Paper?',
    options: [
      "A short document stating your country's stance and proposed solutions on the agenda topics",
      'The final resolution adopted by the committee',
      'A list of all delegates in the committee',
      "The chair's evaluation of your performance",
    ],
    correct: 0,
    why: "It's your country's official stance — most conferences require one per committee before day one.",
  },
  {
    q: 'Which part of a resolution contains the actions the committee will take?',
    options: ['Operative clauses', 'Preambulatory clauses', 'Signatories list', 'Sponsor header'],
    correct: 0,
    why: 'Operative clauses are numbered action items; preambulatory clauses only give context and justification.',
  },
  {
    q: 'What does "yielding to questions" mean after a speech?',
    options: [
      'Offering your remaining time for other delegates to ask you questions',
      'Giving up your right to vote',
      'Passing your speech to another delegate to finish',
      'Requesting the chair to extend debate',
    ],
    correct: 0,
    why: 'A delegate with time remaining may yield it to questions (points of information), to another delegate, or back to the chair.',
  },
  {
    q: 'What is a "bloc" in MUN negotiations?',
    options: [
      'An informal group of countries working together on a draft resolution',
      'A procedural ban on speaking',
      'The seating arrangement of the committee',
      'A type of amendment',
    ],
    correct: 0,
    why: 'Blocs form around shared interests — building and leading one is a core skill for experienced delegates.',
  },
  {
    q: 'An unfriendly amendment is one that…',
    options: [
      'Is not approved by all sponsors of the draft resolution, so the committee votes on it',
      'Uses impolite language',
      'Is submitted after the deadline',
      'Deletes the entire resolution',
    ],
    correct: 0,
    why: 'Friendly amendments are accepted by all sponsors automatically; unfriendly ones go to a committee vote.',
  },
  {
    q: 'What happens during roll call at the start of a session?',
    options: [
      'Countries answer "present" or "present and voting" — the latter waives the right to abstain',
      'Delegates submit their position papers',
      'The chair announces the agenda winner',
      'Awards are distributed',
    ],
    correct: 0,
    why: '"Present and voting" locks you into voting yes or no on substantive matters — no abstentions.',
  },
  {
    q: 'What is the role of the Secretary-General at a conference?',
    options: [
      'Leads the secretariat that organizes and oversees the whole conference',
      'Chairs every committee simultaneously',
      'Represents the host country in the General Assembly',
      'Writes all draft resolutions in advance',
    ],
    correct: 0,
    why: 'The Sec-Gen heads the organizing secretariat — the team behind committees, chairs, logistics and crisis arcs.',
  },
];

export const LEVEL_RESULT = {
  advanced: {
    title: 'Advanced delegate',
    text: 'You know the floor. Time to lead blocs, chase Best Delegate, and consider applying to chair.',
  },
  intermediate: {
    title: 'Intermediate delegate',
    text: 'Solid base — sharpen your resolution drafting and caucus leadership to reach the next tier.',
  },
  rookie: {
    title: 'Rookie delegate',
    text: 'Everyone starts here. Go through the Academy starter pack and your first committee will feel like home.',
  },
};

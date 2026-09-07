/**
 * benchmarks.js
 * Empirical benchmark results from Phase 2 live dual-model evaluation runs
 * (QuickCart Technologies and FinPulse Technologies).
 */

export const QUICKCART_BENCHMARK = {
  model_a: {
    model_name: "gemini-3.7-flash",
    score: 23.3,
    results: [
      {
        id: "purpose_specification",
        requirement: "Policy must clearly state the specific purpose(s) for which personal data is collected and processed.",
        status: "Met",
        cited_sections: ["Section 4", "Section 7"],
        reason: "The policy mentions general purposes such as processing orders, delivery, promotions, and service personalization.",
        suggested_fix: null,
        confidence: 95
      },
      {
        id: "consent_mechanism",
        requirement: "Policy must describe how free, specific, informed, unconditional, and unambiguous consent is obtained from Data Principals before processing their personal data.",
        status: "Missing",
        cited_sections: ["Section 6(1)", "Section 6(10)"],
        reason: "The policy does not describe any mechanism for obtaining affirmative or unambiguous consent prior to processing.",
        suggested_fix: "Implement an explicit opt-in consent mechanism prior to registration or data collection with clear affirmative action.",
        confidence: 95
      },
      {
        id: "notice_before_collection",
        requirement: "Policy must describe the notice provided to Data Principals before or at the time of data collection, specifying what data is collected and for what purpose.",
        status: "Partially Met",
        cited_sections: ["Section 5", "Section 13"],
        reason: "The policy lists collected items and general uses, but omits notice regarding rights withdrawal or complaint channels.",
        suggested_fix: "Provide a comprehensive pre-collection notice detailing data categories, purpose, and statutory rights under Section 5.",
        confidence: 90
      },
      {
        id: "consent_withdrawal",
        requirement: "Policy must provide a mechanism for Data Principals to withdraw consent at any time, with ease comparable to how consent was given, and state consequences of withdrawal.",
        status: "Missing",
        cited_sections: ["Section 6(4)", "Section 6(5)", "Section 6(6)"],
        reason: "The policy contains no mechanism or information regarding consent withdrawal rights or cessation of processing.",
        suggested_fix: "Add an explicit mechanism enabling users to withdraw consent as easily as it was given, and describe the consequences of withdrawal.",
        confidence: 95
      },
      {
        id: "lawful_basis",
        requirement: "Policy must identify the lawful basis for each processing activity — either explicit consent from the Data Principal or a specific legitimate use as defined under the Act.",
        status: "Missing",
        cited_sections: ["Section 4", "Section 7"],
        reason: "No lawful basis or statutory legitimate uses under the DPDP Act 2023 are identified.",
        suggested_fix: "Formally identify the lawful basis (consent or specified legitimate uses under Section 7) for each data processing activity.",
        confidence: 90
      },
      {
        id: "data_minimisation",
        requirement: "Policy must state that only personal data strictly necessary for the specified purpose is collected, and that data is not processed beyond that purpose.",
        status: "Missing",
        cited_sections: ["Section 4", "Section 8(7)"],
        reason: "There is no commitment to data minimization or limiting collection to only what is necessary.",
        suggested_fix: "Add an explicit data minimisation statement affirming only strictly necessary personal data is collected for declared purposes.",
        confidence: 90
      },
      {
        id: "data_retention_deletion",
        requirement: "Policy must state the data retention period and describe how and when personal data is erased or deleted once the purpose is fulfilled or consent is withdrawn.",
        status: "Missing",
        cited_sections: ["Section 8(7)", "Section 12"],
        reason: "The policy contains no mention of data retention timelines, deletion schedules, or post-fulfillment erasure.",
        suggested_fix: "Define specific retention schedules and an automated erasure process once the fulfillment purpose lapses or consent is withdrawn.",
        confidence: 95
      },
      {
        id: "security_safeguards",
        requirement: "Policy must describe the technical and organisational security safeguards implemented to protect personal data from unauthorised access, breach, or loss.",
        status: "Partially Met",
        cited_sections: ["Section 8(5)"],
        reason: "The policy mentions industry-standard security and encryption for payments, but lacks details on organisational measures.",
        suggested_fix: "Detail comprehensive technical, organisational, and access control safeguards in compliance with Section 8(5).",
        confidence: 85
      },
      {
        id: "breach_notification",
        requirement: "Policy must state how and within what timeframe Data Principals will be notified in the event of a personal data breach.",
        status: "Missing",
        cited_sections: ["Section 8(6)"],
        reason: "The policy does not mention personal data breach notification to Data Principals or the Data Protection Board.",
        suggested_fix: "Incorporate mandatory breach notification procedures committing to inform affected Data Principals and the Board promptly upon any breach.",
        confidence: 95
      },
      {
        id: "right_to_access",
        requirement: "Policy must describe how Data Principals can obtain a summary of their personal data being processed and the identities of third parties with whom it has been shared.",
        status: "Missing",
        cited_sections: ["Section 11"],
        reason: "No mechanism is provided for Data Principals to request a summary of processed data or identities of sharing parties.",
        suggested_fix: "Provide a clear procedure for users to request and receive a complete summary of their processed personal data under Section 11.",
        confidence: 95
      },
      {
        id: "right_to_correction_erasure",
        requirement: "Policy must describe how Data Principals can request correction, completion, updating, or erasure of their personal data held by the organisation.",
        status: "Missing",
        cited_sections: ["Section 12"],
        reason: "The policy does not state any right or procedure for users to correct, complete, update, or erase personal data.",
        suggested_fix: "Establish a dedicated channel allowing users to request correction, updating, or complete erasure of their personal records under Section 12.",
        confidence: 95
      },
      {
        id: "grievance_redressal",
        requirement: "Policy must provide a readily available grievance redressal mechanism with contact details of a Data Protection Officer or designated contact, and commit to responding within a reasonable time.",
        status: "Partially Met",
        cited_sections: ["Section 13", "Section 8(10)"],
        reason: "A generic support email is listed, but no designated Grievance Officer, contact address, or response SLA is provided.",
        suggested_fix: "Designate a named Grievance Officer with complete contact details and publish a defined SLA for grievance resolution under Section 13.",
        confidence: 90
      },
      {
        id: "children_data_processing",
        requirement: "Policy must state whether personal data of children (under 18 years) is processed, and if so, describe how verifiable parental or guardian consent is obtained, and confirm no tracking or targeted advertising is directed at children.",
        status: "Partially Met",
        cited_sections: ["Section 9"],
        reason: "The policy states services are not intended for under 18s, but does not provide age verification or parental consent guidelines.",
        suggested_fix: "Clarify age verification procedures and explicitly prohibit behavioural tracking or targeted advertising directed at minors under Section 9.",
        confidence: 85
      },
      {
        id: "third_party_data_sharing",
        requirement: "Policy must disclose whether personal data is shared with third-party Data Processors or other Data Fiduciaries, and describe the categories of such entities and the basis for sharing.",
        status: "Partially Met",
        cited_sections: ["Section 8(2)", "Section 11"],
        reason: "The policy mentions sharing with delivery partners and payment processors, but does not specify contract-based processing safeguards.",
        suggested_fix: "Specify the categories of third-party processors and affirm that sharing occurs strictly under legally binding data protection agreements.",
        confidence: 85
      },
      {
        id: "cross_border_transfer",
        requirement: "Policy must state whether personal data is transferred outside India for processing, and under what terms or restrictions such transfer occurs.",
        status: "Missing",
        cited_sections: ["Section 16", "Section 3"],
        reason: "The policy makes no statement regarding cross-border transfer of data outside India.",
        suggested_fix: "Disclose whether data is transferred outside India and verify compliance with Central Government transfer restrictions under Section 16.",
        confidence: 95
      }
    ]
  },
  model_b: {
    model_name: "gemini-3.5-flash",
    score: 23.3,
    results: [
      {
        id: "purpose_specification",
        requirement: "Policy must clearly state the specific purpose(s) for which personal data is collected and processed.",
        status: "Met",
        cited_sections: ["Section 4", "Section 7"],
        reason: "Purposes including order fulfillment, communications, and service personalization are stated.",
        suggested_fix: null,
        confidence: 95
      },
      {
        id: "consent_mechanism",
        requirement: "Policy must describe how free, specific, informed, unconditional, and unambiguous consent is obtained from Data Principals before processing their personal data.",
        status: "Missing",
        cited_sections: ["Section 6(1)", "Section 6(10)"],
        reason: "There is no description of obtaining affirmative opt-in consent from users.",
        suggested_fix: "Introduce clear affirmative consent checkboxes before collecting any personal data.",
        confidence: 95
      },
      {
        id: "notice_before_collection",
        requirement: "Policy must describe the notice provided to Data Principals before or at the time of data collection, specifying what data is collected and for what purpose.",
        status: "Partially Met",
        cited_sections: ["Section 5", "Section 13"],
        reason: "Identifies data categories and purposes, but fails to provide statutory notice elements including grievance redressal.",
        suggested_fix: "Provide statutory pre-collection notices covering all mandatory disclosures under Section 5.",
        confidence: 95
      },
      {
        id: "consent_withdrawal",
        requirement: "Policy must provide a mechanism for Data Principals to withdraw consent at any time, with ease comparable to how consent was given, and state consequences of withdrawal.",
        status: "Missing",
        cited_sections: ["Section 6(4)", "Section 6(5)", "Section 6(6)"],
        reason: "Complete omission of withdrawal rights, mechanism, or consequences.",
        suggested_fix: "Implement an easily accessible toggle or link for instant consent withdrawal.",
        confidence: 100
      },
      {
        id: "lawful_basis",
        requirement: "Policy must identify the lawful basis for each processing activity — either explicit consent from the Data Principal or a specific legitimate use as defined under the Act.",
        status: "Missing",
        cited_sections: ["Section 4", "Section 7"],
        reason: "The policy fails to establish any lawful basis under the Act.",
        suggested_fix: "Classify all processing under explicit consent or statutory legitimate grounds.",
        confidence: 90
      },
      {
        id: "data_minimisation",
        requirement: "Policy must state that only personal data strictly necessary for the specified purpose is collected, and that data is not processed beyond that purpose.",
        status: "Missing",
        cited_sections: ["Section 4", "Section 8(7)"],
        reason: "No statement limiting collection strictly to necessary elements.",
        suggested_fix: "Add express commitments limiting collection strictly to what is required for delivery and transactions.",
        confidence: 90
      },
      {
        id: "data_retention_deletion",
        requirement: "Policy must state the data retention period and describe how and when personal data is erased or deleted once the purpose is fulfilled or consent is withdrawn.",
        status: "Missing",
        cited_sections: ["Section 8(7)", "Section 12"],
        reason: "No data retention or disposal policy is outlined.",
        suggested_fix: "Formulate and publish clear data retention durations and automated erasure workflows.",
        confidence: 100
      },
      {
        id: "security_safeguards",
        requirement: "Policy must describe the technical and organisational security safeguards implemented to protect personal data from unauthorised access, breach, or loss.",
        status: "Partially Met",
        cited_sections: ["Section 8(5)"],
        reason: "General claim of industry-standard security and payment encryption lacks organisational measures.",
        suggested_fix: "Document comprehensive organizational and physical safeguards.",
        confidence: 90
      },
      {
        id: "breach_notification",
        requirement: "Policy must state how and within what timeframe Data Principals will be notified in the event of a personal data breach.",
        status: "Missing",
        cited_sections: ["Section 8(6)"],
        reason: "Completely absent from the policy.",
        suggested_fix: "Commit to timely statutory breach intimation to the Board and affected principals.",
        confidence: 100
      },
      {
        id: "right_to_access",
        requirement: "Policy must describe how Data Principals can obtain a summary of their personal data being processed and the identities of third parties with whom it has been shared.",
        status: "Missing",
        cited_sections: ["Section 11"],
        reason: "No provision exists for data access summaries.",
        suggested_fix: "Create a user access request workflow under Section 11.",
        confidence: 100
      },
      {
        id: "right_to_correction_erasure",
        requirement: "Policy must describe how Data Principals can request correction, completion, updating, or erasure of their personal data held by the organisation.",
        status: "Missing",
        cited_sections: ["Section 12"],
        reason: "No right to correction or erasure is mentioned.",
        suggested_fix: "Enable user self-serve or email-based data correction and deletion requests.",
        confidence: 100
      },
      {
        id: "grievance_redressal",
        requirement: "Policy must provide a readily available grievance redressal mechanism with contact details of a Data Protection Officer or designated contact, and commit to responding within a reasonable time.",
        status: "Partially Met",
        cited_sections: ["Section 13", "Section 8(10)"],
        reason: "Only a generic support email is present without grievance redressal details or timelines.",
        suggested_fix: "Appoint and identify a Grievance Redressal Officer with physical address and resolution timeline.",
        confidence: 95
      },
      {
        id: "children_data_processing",
        requirement: "Policy must state whether personal data of children (under 18 years) is processed, and if so, describe how verifiable parental or guardian consent is obtained, and confirm no tracking or targeted advertising is directed at children.",
        status: "Partially Met",
        cited_sections: ["Section 9"],
        reason: "Excludes children under 18 but does not detail verification or tracking restrictions.",
        suggested_fix: "Provide clear age assurance measures and confirm absence of profiling.",
        confidence: 90
      },
      {
        id: "third_party_data_sharing",
        requirement: "Policy must disclose whether personal data is shared with third-party Data Processors or other Data Fiduciaries, and describe the categories of such entities and the basis for sharing.",
        status: "Partially Met",
        cited_sections: ["Section 8(2)", "Section 11"],
        reason: "Lists broad categories of partners but lacks processing agreements disclosure.",
        suggested_fix: "Confirm all data processors are bound by contract pursuant to Section 8(2).",
        confidence: 90
      },
      {
        id: "cross_border_transfer",
        requirement: "Policy must state whether personal data is transferred outside India for processing, and under what terms or restrictions such transfer occurs.",
        status: "Missing",
        cited_sections: ["Section 16", "Section 3"],
        reason: "Zero mention of data storage jurisdiction or cross-border transfers.",
        suggested_fix: "State geographical storage location and compliance with cross-border transfer laws.",
        confidence: 100
      }
    ]
  },
  agreement_rate: 1.0,
  disagreements: []
};

export const FINPULSE_BENCHMARK = {
  model_a: {
    model_name: "gemini-3.7-flash",
    score: 60.0,
    results: [
      {
        id: "purpose_specification",
        requirement: "Policy must clearly state the specific purpose(s) for which personal data is collected and processed.",
        status: "Met",
        cited_sections: ["Section 4", "Section 7"],
        reason: "Section 2 explicitly articulates itemized lawful purposes including account setup, statutory ID verification, and transactional notices.",
        suggested_fix: null,
        confidence: 100
      },
      {
        id: "consent_mechanism",
        requirement: "Policy must describe how free, specific, informed, unconditional, and unambiguous consent is obtained from Data Principals before processing their personal data.",
        status: "Partially Met",
        cited_sections: ["Section 6(1)"],
        reason: "Affirmative opt-in consent is mentioned prior to activation, but the policy omits stating that consent must be unconditional and granular.",
        suggested_fix: "Explicitly clarify that consent is unconditional and provide separate itemized opt-in consent toggles for distinct processing purposes.",
        confidence: 90
      },
      {
        id: "notice_before_collection",
        requirement: "Policy must describe the notice provided to Data Principals before or at the time of data collection, specifying what data is collected and for what purpose.",
        status: "Met",
        cited_sections: ["Section 5"],
        reason: "The policy enumerates data types collected and provides notice of specific purposes before account activation.",
        suggested_fix: null,
        confidence: 100
      },
      {
        id: "consent_withdrawal",
        requirement: "Policy must provide a mechanism for Data Principals to withdraw consent at any time, with ease comparable to how consent was given, and state consequences of withdrawal.",
        status: "Partially Met",
        cited_sections: ["Section 6(4)", "Section 6(5)"],
        reason: "Allows email withdrawal, but email communication does not match the 'comparable ease' standard of registration-time click opt-in.",
        suggested_fix: "Implement an in-app 1-click consent withdrawal toggle within user profile settings matching the registration opt-in ease.",
        confidence: 95
      },
      {
        id: "lawful_basis",
        requirement: "Policy must identify the lawful basis for each processing activity — either explicit consent from the Data Principal or a specific legitimate use as defined under the Act.",
        status: "Met",
        cited_sections: ["Section 4", "Section 7"],
        reason: "Section 2 identifies both explicit consent and statutory duties as the twin lawful grounds for processing activities.",
        suggested_fix: null,
        confidence: 95
      },
      {
        id: "data_minimisation",
        requirement: "Policy must state that only personal data strictly necessary for the specified purpose is collected, and that data is not processed beyond that purpose.",
        status: "Partially Met",
        cited_sections: ["Section 6(1)"],
        reason: "States data is collected solely for specified purposes, but lacks an explicit declaration limiting collection strictly to necessary fields.",
        suggested_fix: "Incorporate an explicit data minimization clause stating that only personal data strictly necessary for specified purposes is collected.",
        confidence: 90
      },
      {
        id: "data_retention_deletion",
        requirement: "Policy must state the data retention period and describe how and when personal data is erased or deleted once the purpose is fulfilled or consent is withdrawn.",
        status: "Met",
        cited_sections: ["Section 8(7)"],
        reason: "Section 4 establishes clear retention criteria and a mandatory 5-year post-account closure period followed by permanent erasure.",
        suggested_fix: null,
        confidence: 100
      },
      {
        id: "security_safeguards",
        requirement: "Policy must describe the technical and organisational security safeguards implemented to protect personal data from unauthorised access, breach, or loss.",
        status: "Met",
        cited_sections: ["Section 8(5)"],
        reason: "Section 6 specifies administrative, technical, and physical safeguards including TLS 1.3 protocol encryption for all financial transactions.",
        suggested_fix: null,
        confidence: 95
      },
      {
        id: "breach_notification",
        requirement: "Policy must state how and within what timeframe Data Principals will be notified in the event of a personal data breach.",
        status: "Missing",
        cited_sections: ["Section 8(6)"],
        reason: "The policy contains no mention of procedures for intimation of personal data breaches to the Board or affected Data Principals.",
        suggested_fix: "Add a personal data breach notification commitment outlining mandatory intimation to the Data Protection Board and affected users under Section 8(6).",
        confidence: 100
      },
      {
        id: "right_to_access",
        requirement: "Policy must describe how Data Principals can obtain a summary of their personal data being processed and the identities of third parties with whom it has been shared.",
        status: "Missing",
        cited_sections: ["Section 11"],
        reason: "The policy completely omits the Data Principal's statutory right to obtain a summary of processed data and third-party identities.",
        suggested_fix: "Describe the specific workflow for users to submit data access requests to receive a comprehensive summary of their processed records under Section 11.",
        confidence: 100
      },
      {
        id: "right_to_correction_erasure",
        requirement: "Policy must describe how Data Principals can request correction, completion, updating, or erasure of their personal data held by the organisation.",
        status: "Missing",
        cited_sections: ["Section 12"],
        reason: "No mechanism or rights regarding correction, updating, or erasure of inaccurate personal data are detailed.",
        suggested_fix: "Incorporate express procedures for Data Principals to request correction, completion, or erasure of their personal data under Section 12.",
        confidence: 100
      },
      {
        id: "grievance_redressal",
        requirement: "Policy must provide a readily available grievance redressal mechanism with contact details of a Data Protection Officer or designated contact, and commit to responding within a reasonable time.",
        status: "Met",
        cited_sections: ["Section 13", "Section 8(10)"],
        reason: "Section 7 designates a named Grievance Officer (Ananya Roy), business address, email, and a binding 30-day resolution commitment.",
        suggested_fix: null,
        confidence: 100
      },
      {
        id: "children_data_processing",
        requirement: "Policy must state whether personal data of children (under 18 years) is processed, and if so, describe how verifiable parental or guardian consent is obtained, and confirm no tracking or targeted advertising is directed at children.",
        status: "Missing",
        cited_sections: ["Section 9"],
        reason: "The policy is completely silent regarding children's data, parental consent verification, or prohibitions on tracking minors.",
        suggested_fix: "Include an explicit clause addressing processing of minors' data, verifiable parental consent mechanisms, and a ban on tracking minors under Section 9.",
        confidence: 100
      },
      {
        id: "third_party_data_sharing",
        requirement: "Policy must disclose whether personal data is shared with third-party Data Processors or other Data Fiduciaries, and describe the categories of such entities and the basis for sharing.",
        status: "Partially Met",
        cited_sections: ["Section 8(2)", "Section 11"],
        reason: "Mentions payment gateways and cloud infrastructure under binding agreements, but omits specific entity identities or categories.",
        suggested_fix: "Disclose specific categories of third-party processors and affirm they act solely under valid data processing agreements pursuant to Section 8(2).",
        confidence: 85
      },
      {
        id: "cross_border_transfer",
        requirement: "Policy must state whether personal data is transferred outside India for processing, and under what terms or restrictions such transfer occurs.",
        status: "Met",
        cited_sections: ["Section 16"],
        reason: "Section 8 explicitly confirms that all user data is hosted exclusively on servers within India and prohibits cross-border transfers.",
        suggested_fix: null,
        confidence: 100
      }
    ]
  },
  model_b: {
    model_name: "gemini-3.5-flash",
    score: 46.7,
    results: [
      {
        id: "purpose_specification",
        requirement: "Policy must clearly state the specific purpose(s) for which personal data is collected and processed.",
        status: "Met",
        cited_sections: ["Section 4", "Section 7"],
        reason: "Itemized statutory purposes are explicitly stated in Clause 2.",
        suggested_fix: null,
        confidence: 100
      },
      {
        id: "consent_mechanism",
        requirement: "Policy must describe how free, specific, informed, unconditional, and unambiguous consent is obtained from Data Principals before processing their personal data.",
        status: "Partially Met",
        cited_sections: ["Section 6(1)"],
        reason: "Requires opt-in consent at registration, but does not state that consent is unconditional or separate from terms of service.",
        suggested_fix: "Decouple consent from general terms of service and ensure unconditional opt-in.",
        confidence: 85
      },
      {
        id: "notice_before_collection",
        requirement: "Policy must describe the notice provided to Data Principals before or at the time of data collection, specifying what data is collected and for what purpose.",
        status: "Partially Met",
        cited_sections: ["Section 5(1)", "Section 13"],
        reason: "Notice includes data fields and purposes, but omits mandatory Section 5(1)(c) notice on the manner in which the Data Principal may make a complaint to the Board.",
        suggested_fix: "Include statutory notice informing users of their right and method to lodge a complaint with the Data Protection Board.",
        confidence: 95
      },
      {
        id: "consent_withdrawal",
        requirement: "Policy must provide a mechanism for Data Principals to withdraw consent at any time, with ease comparable to how consent was given, and state consequences of withdrawal.",
        status: "Partially Met",
        cited_sections: ["Section 6(4)", "Section 6(5)"],
        reason: "Email-based withdrawal does not match the ease of the initial click-through opt-in mechanism.",
        suggested_fix: "Implement a digital self-serve consent withdrawal portal with comparable ease to onboarding.",
        confidence: 95
      },
      {
        id: "lawful_basis",
        requirement: "Policy must identify the lawful basis for each processing activity — either explicit consent from the Data Principal or a specific legitimate use as defined under the Act.",
        status: "Partially Met",
        cited_sections: ["Section 4", "Section 7"],
        reason: "General reference to consent and statutory duties is made, but lacks mapping between specific data types and distinct Section 7 grounds.",
        suggested_fix: "Itemize a table mapping each specific category of personal data to its exact statutory ground under Section 4 and Section 7.",
        confidence: 95
      },
      {
        id: "data_minimisation",
        requirement: "Policy must state that only personal data strictly necessary for the specified purpose is collected, and that data is not processed beyond that purpose.",
        status: "Partially Met",
        cited_sections: ["Section 6(1)"],
        reason: "No explicit limitation restricting collection strictly to the minimum necessary personal data.",
        suggested_fix: "Explicitly articulate a data minimization policy restricting collection strictly to what is necessary.",
        confidence: 85
      },
      {
        id: "data_retention_deletion",
        requirement: "Policy must state the data retention period and describe how and when personal data is erased or deleted once the purpose is fulfilled or consent is withdrawn.",
        status: "Partially Met",
        cited_sections: ["Section 8(7)"],
        reason: "Outlines a 5-year retention schedule, but lacks an explicit trigger for immediate erasure upon consent withdrawal where no statutory duty persists.",
        suggested_fix: "Provide an early deletion procedure that activates immediately if the user withdraws consent prior to the 5-year statutory period.",
        confidence: 95
      },
      {
        id: "security_safeguards",
        requirement: "Policy must describe the technical and organisational security safeguards implemented to protect personal data from unauthorised access, breach, or loss.",
        status: "Partially Met",
        cited_sections: ["Section 8(5)"],
        reason: "Mentions TLS 1.3 encryption, but administrative and physical safeguards are referenced only in general terms without technical specifics.",
        suggested_fix: "Document specific administrative controls such as role-based access, vulnerability assessments, and audit logs.",
        confidence: 85
      },
      {
        id: "breach_notification",
        requirement: "Policy must state how and within what timeframe Data Principals will be notified in the event of a personal data breach.",
        status: "Missing",
        cited_sections: ["Section 8(6)"],
        reason: "Completely absent from policy text.",
        suggested_fix: "Add breach reporting commitments to the Board and affected users.",
        confidence: 100
      },
      {
        id: "right_to_access",
        requirement: "Policy must describe how Data Principals can obtain a summary of their personal data being processed and the identities of third parties with whom it has been shared.",
        status: "Missing",
        cited_sections: ["Section 11"],
        reason: "Completely absent from policy text.",
        suggested_fix: "Establish a formal procedure for summary data access requests.",
        confidence: 100
      },
      {
        id: "right_to_correction_erasure",
        requirement: "Policy must describe how Data Principals can request correction, completion, updating, or erasure of their personal data held by the organisation.",
        status: "Missing",
        cited_sections: ["Section 12"],
        reason: "Completely absent from policy text.",
        suggested_fix: "Provide contact instructions for data correction, rectification, and erasure.",
        confidence: 100
      },
      {
        id: "grievance_redressal",
        requirement: "Policy must provide a readily available grievance redressal mechanism with contact details of a Data Protection Officer or designated contact, and commit to responding within a reasonable time.",
        status: "Met",
        cited_sections: ["Section 13", "Section 8(10)"],
        reason: "Designates Grievance Officer by name with email, physical address, and 30-day response timeline.",
        suggested_fix: null,
        confidence: 100
      },
      {
        id: "children_data_processing",
        requirement: "Policy must state whether personal data of children (under 18 years) is processed, and if so, describe how verifiable parental or guardian consent is obtained, and confirm no tracking or targeted advertising is directed at children.",
        status: "Missing",
        cited_sections: ["Section 9"],
        reason: "Completely absent from policy text.",
        suggested_fix: "Add explicit disclosures on minors' data and parental consent verification.",
        confidence: 100
      },
      {
        id: "third_party_data_sharing",
        requirement: "Policy must disclose whether personal data is shared with third-party Data Processors or other Data Fiduciaries, and describe the categories of such entities and the basis for sharing.",
        status: "Partially Met",
        cited_sections: ["Section 8(2)", "Section 11"],
        reason: "Discloses payment gateways under binding contracts, but omits specific named entities or complete categories.",
        suggested_fix: "Itemize third-party processor categories and describe processing agreements under Section 8(2).",
        confidence: 90
      },
      {
        id: "cross_border_transfer",
        requirement: "Policy must state whether personal data is transferred outside India for processing, and under what terms or restrictions such transfer occurs.",
        status: "Met",
        cited_sections: ["Section 16"],
        reason: "Explicitly confirms all data hosted and processed exclusively within India.",
        suggested_fix: null,
        confidence: 100
      }
    ]
  },
  agreement_rate: 0.7333,
  disagreements: [
    {
      item_id: "notice_before_collection",
      requirement: "Policy must describe the notice provided to Data Principals before or at the time of data collection, specifying what data is collected and for what purpose.",
      model_a_status: "Met",
      model_b_status: "Partially Met"
    },
    {
      item_id: "lawful_basis",
      requirement: "Policy must identify the lawful basis for each processing activity — either explicit consent from the Data Principal or a specific legitimate use as defined under the Act.",
      model_a_status: "Met",
      model_b_status: "Partially Met"
    },
    {
      item_id: "data_retention_deletion",
      requirement: "Policy must state the data retention period and describe how and when personal data is erased or deleted once the purpose is fulfilled or consent is withdrawn.",
      model_a_status: "Met",
      model_b_status: "Partially Met"
    },
    {
      item_id: "security_safeguards",
      requirement: "Policy must describe the technical and organisational security safeguards implemented to protect personal data from unauthorised access, breach, or loss.",
      model_a_status: "Met",
      model_b_status: "Partially Met"
    }
  ]
};

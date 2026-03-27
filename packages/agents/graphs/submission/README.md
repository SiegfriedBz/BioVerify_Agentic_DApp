# BIOVERIFY

> **Trigger Source:** This graph is triggered by the `api/webhooks/alchemy/submission` webhook, responding to the on-chain `BioVerify_SubmittedPublication` event.

## AI SUBMISSION GRAPH

This LangGraph orchestrates the autonomous pre-validation of scientific submissions. It serves as a decentralized **"Proof of Originality"** filter, acting as an automated gatekeeper to ensure only novel research enters the peer-review pool.

### Flow Logic

* **IPFS Ingestion**
Resolution of the multi-layer manifest. The agent fetches the publication metadata and the abstract from IPFS to prepare the forensic context.

* **Forensic Search**
Utilizes the **Tavily Search Tool** to perform multi-source web crawling. This step identifies existing literature, pre-prints, or similar datasets that could indicate plagiarism or lack of novelty.

* **AI Pre-Validation Verdict**
The final LLM-driven node analyzes the forensic search results. It determines if the submission is a unique contribution or a violation of protocol integrity.

---

### Outcomes

#### **Scenario: PASS**

* **Validation:** The paper is deemed original.
* **Next Step:** The protocol triggers **Chainlink VRF** to select the peer reviewers and senior editor.
* **Status:** The scientist's stake remains safely locked in the protocol.

#### **Scenario: FAIL**

* **Validation:** Clear evidence of plagiarism detected.
* **Immediate Slash:** The scientist's stake is immediately confiscated by the smart contract.
* **Protocol Ban:** The publisher's reputation score is penalized to prevent future sybil-spam.

---

### Logic Principle

**Efficiency First**: By filtering out low-quality or fraudulent submissions autonomously, the protocol saves human reviewers' time and ensures that staking rewards are only generated for genuine scientific advancement.

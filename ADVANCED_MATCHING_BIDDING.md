# 🤖 AI Matching & Bidding Intelligence Plan

This plan focuses on enhancing the "Liquidity" of the marketplace through AI-driven connections and monetization strategies for freelancers.

## 1. Proposal Boosting (The Connects Economy)
Monetize and prioritize proposals.
### 🎯 Features
- **Bid for Placement:** Freelancers can spend extra "Connects" to appear at the top of the client's proposal list.
- **Slot System:** Top 3 slots are reserved for boosted proposals.
- **Performance-based Connects Refund:** If the client doesn't view the boosted proposal, refund a portion of the connects.
### 🛠️ Sub-tasks
- [ ] **Backend (Job/Payment Service):**
    - Add `boostAmount` to `Proposal` model.
    - Update proposal listing logic to sort by `boostAmount` + `aiScore`.
- [ ] **Frontend:**
    - "Boost your proposal" UI during the job application flow.

## 2. AI Screener & Smart Ranking
Automate the first pass of hiring for clients.
### 🎯 Features
- **Deep Compatibility Score:** Using LLM to compare Job Description vs Freelancer Specialized Profile + History.
- **Screening Questions AI:** Automatically analyze answers to custom screening questions and label them as "Strong Match", "Potential", or "Weak".
- **Real-time Ranking:** Update ranks as new data comes in (e.g., freelancer just finished a similar job).
### 🛠️ Sub-tasks
- [ ] **Backend (Analytics/Job Service):**
    - Implement a job that triggers on proposal submission to fetch `aiScore`.
    - Integration with OpenAI/Gemini to perform the analysis.

## 3. Skill Badges & Verified Assessments
Move beyond self-reported skills.
### 🎯 Features
- **Automated Skill Tests:** Integration with platforms like HackerRank/Codility.
- **AI Portfolio Verification:** Analyze a freelancer's GitHub/Behance to confirm they actually have the skills they claim.
- **"Top Rated" & "Expert-Vetted" Badges:** Automated logic to award badges based on JSS, consistency, and vetting.
### 🛠️ Sub-tasks
- [ ] **Backend (User Service):**
    - Automated Badge Service that runs nightly to update statuses.

---
> [!TIP]
> Bidding logic should be carefully balanced to prevent "pay-to-play" from ruining quality—the `aiScore` should always remain a significant factor in ranking.

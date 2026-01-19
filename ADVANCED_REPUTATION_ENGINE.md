# 🏆 Reputation Engine & Badge Logic Plan

Trust is the currency of the marketplace. This plan outlines a mathematical approach to calculating "quality" and awarding status.

## 1. Job Success Score (JSS) 2.0
A sophisticated, non-linear score that reflects true client satisfaction.
### 🎯 Features
- **Private vs Public Feedback:** Give more weight to "Would you recommend this freelancer?" (private) than the 5-star rating (public).
- **Contract Value Weighting:** Sucess on a $10,000 project should impact the score more than a $50 project.
- **Long-term Relationship Bonus:** Bonus points for clients who hire the same freelancer multiple times.
- **Recency Decay:** New work has a higher impact on the score than work from 2 years ago.
### 🛠️ Sub-tasks
- [ ] **Backend (Analytics/Review Service):**
    - Implement a scheduled job that runs every 2 weeks to recalculate JSS for all active freelancers.

## 2. Automated Badge Engine
Status as a motivator.
### 🎯 Features
- **Rising Star:** 100% profile completeness + 5+ successful small jobs + active in the last 7 days.
- **Top Rated:** 90%+ JSS + $1k+ earnings in 12 months + no recent account flags.
- **Top Rated Plus:** Worked on "Large" contracts ($5k-$10k+) + maintained Top Rated status for 16 weeks.
- **Expert-Vetted (Manual):** Granted to top 1% after manual interview by platform admins.
### 🛠️ Sub-tasks
- [ ] **Backend (User Service):**
    - Create a `BadgePolicy` engine.
    - Integration with `analytics-service` to fetch earnings data.

## 3. Client Reputation (The Fair Play)
Marketplaces are two-sided.
### 🎯 Features
- **Client Rating:** Show freelancers how the client treats others (e.g., "Avg. $15/hr paid", "Quick to approve milestones").
- **Hiring Rate:** "This client hires for 80% of their job posts".
- **Spend Tiers:** Badges for clients who have spent $10k, $100k, $1M+ on the platform.

---
> [!TIP]
> Visibility in search should be directly tied to JSS and Badges. High-quality talent stays if they see they are prioritized.

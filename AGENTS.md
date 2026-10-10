<!-- BEGIN BreatheSafe Dispatcher project brief -->
# BreatheSafe Dispatcher

Reducing delivery rider PM2.5 exposure without slowing the city down.

## Hackathon Goal

Build a deployed web app for the Environmental Hacks hackathon, Track 01: Air. The project must solve a real environmental problem for a specific group: Delhi/NCR delivery riders who spend long shifts outdoors during high-PM2.5 periods.

The project should stay small, working, measurable, and demo-friendly. A small problem solved well beats a broad platform that only works vaguely.

## Product Scope

BreatheSafe Dispatcher is a pollution-aware dispatch assistant for quick-commerce and delivery platforms. It recommends lower-exposure delivery decisions using low-cost operational changes companies already control:

- Choose a cleaner nearby dark store when it adds only a small delay.
- Choose a lower-exposure route when the tradeoff is reasonable.
- Recommend rider safety prompts during high-PM2.5 windows.
- Suggest brief delay/rotation only for severe-risk periods or low-priority orders.

Do not build or claim real Blinkit, Zepto, Swiggy, Zomato, Google Maps, or rider-app integration. Present the app as a realistic prototype/plugin concept using mock delivery data and real or semi-real pollution inputs.

## Non-Goals

- No production-grade routing.
- No exact street-level pollution truth claims.
- No dark-store relocation optimizer.
- No large fleet-management suite.
- No complex multi-model ML system.
- No hardware/sensor dependency.
- No user authentication unless it becomes necessary for deployment.

## Required Slices

Implement the app in thin, useful slices. Each slice should be independently demoable.

### Slice 1: Scenario Data

- Delhi/NCR zones, dark stores, riders, rest zones, and orders.
- Mock delivery data is acceptable and expected.
- Use recognizable zones such as Connaught Place, Karol Bagh, Lajpat Nagar, Saket, Rohini, Dwarka, Noida, Gurugram, Ghaziabad, and Faridabad.
- Include rest zones created by delivery apps for workers, with capacity and amenities such as mask availability, water, seating, and filtered indoor air.

### Slice 2: PM2.5 Baseline

- Use a Hugging Face PM2.5 model as the baseline forecasting component where feasible.
- Keep the ML simple enough to explain and justify:
  - Input: recent PM2.5/AQI, zone/station, hour, weather context if available.
  - Output: PM2.5 forecast or risk class: Low, Moderate, High, Severe.
- If the Hugging Face model is too heavy or mismatched, use cached outputs or a lightweight fallback model while clearly labeling it as baseline/demo data.
- Always compare against a simple baseline if possible, such as current PM2.5 persistence.
- Do not overclaim accuracy. Prefer "good enough to support dispatch decisions" over "street-level accurate."

### Slice 3: Dispatch Decision Engine

- Given an order, compare 2-3 fulfillment options:
  - nearest/fastest dark store,
  - cleaner alternate dark store,
  - balanced recommendation.
- Score each option using:
  - estimated delivery time,
  - distance,
  - PM2.5 exposure score,
  - high-risk kilometers,
  - confidence.
- Primary recommendation format:
  - "Assign from Store B instead of Store A. Adds 2.4 minutes, reduces exposure by 31%."

### Slice 4: Rider Route View

- Show fastest route vs cleaner route vs recommended route.
- Route geometry may be simplified or mock polylines over a Delhi/NCR map.
- Use Leaflet/OpenStreetMap for the map UI unless a better already-installed stack exists.
- Show rider-facing prompts:
  - Use pollution mask.
  - Cleaner route available.
  - Nearest rest zone.
  - Take a short recovery break after repeated high-exposure deliveries.
  - Confirm mask availability before dispatch.

### Slice 5: Safety Prompts Page

- Create a dedicated prompts page/module for rider safety recommendations.
- Prompts should be context-aware and practical, not generic wellness text.
- Include triggers such as:
  - severe PM2.5,
  - route crosses severe zone,
  - rider has repeated high-exposure deliveries,
  - rest zone nearby,
  - mask not confirmed,
  - heat plus pollution risk,
  - low-priority order can wait briefly.

### Slice 6: Metrics Page

Show company-friendly and judge-friendly metrics:

- Average PM2.5 exposure reduction.
- Average delay added.
- High-risk kilometers avoided.
- Percent of deliveries still under SLA.
- Number of mask/rest-zone prompts issued.
- Rider exposure saved per shift.
- Before/after comparison: normal dispatch vs BreatheSafe recommendation.

### Slice 7: AWS Deployment

The final project should be deployable on AWS and produce a live URL.

Preferred stack:

- Frontend: React + Vite + TypeScript.
- Styling: Tailwind CSS.
- Maps: Leaflet + OpenStreetMap.
- Charts: Recharts.
- Backend: AWS Lambda + API Gateway, if backend is needed.
- Data: DynamoDB, if persistence is needed.
- Hosting: AWS Amplify Hosting or S3 + CloudFront.
- Scheduling/data refresh: EventBridge + Lambda if implemented.

For hackathon time, prefer a polished static or mostly-static web app over complex infrastructure. AWS usage must be visible and explainable in the demo.

## Judging Alignment

Always optimize for the hackathon criteria from `comp.md`:

- Real environmental problem: high PM2.5 exposure for outdoor delivery riders in Delhi/NCR.
- Specific impact: reduce exposure while preserving delivery speed.
- AWS usage: deployed on AWS, optionally using Lambda/API Gateway/DynamoDB/EventBridge.
- Design and usability: dispatcher and rider views should be understandable without explanation.
- Execution: one working end-to-end flow beats many unfinished features.
- Demo video: app must support a clear 3-minute walkthrough.

## Demo Story

Use this core demo flow:

1. Severe PM2.5 window in Delhi/NCR.
2. A delivery order appears.
3. Normal dispatch chooses the nearest store/fastest route.
4. BreatheSafe compares options and recommends a cleaner dispatch.
5. The recommendation adds a small delay but reduces exposure.
6. Rider view shows the safer route and prompt to use a mask or visit a nearby rest zone.
7. Metrics page shows exposure saved, delay added, high-risk kilometers avoided, and SLA retained.

## Tone And Claims

- Be honest about mock delivery data.
- Be honest that street-level pollution is approximate.
- Use confidence labels where estimates are interpolated or simulated.
- Emphasize decision support, not perfect prediction.
- Avoid suggesting that companies must slow all deliveries. The system activates during high-risk PM2.5 periods and uses configurable tradeoffs.

<!-- END BreatheSafe Dispatcher project brief -->

<!-- BEGIN AWS Agent Toolkit rules -->
# AWS Guidance for the new AWS experience

This user has signed up for the new AWS experience. This experience lets you sign into AWS using a social provider and requires the following additional context.

Where this guidance conflicts with the project's own instructions, the project's instructions take precedence.

## Context

### Terminology:

- Say "project" instead of "account" - a project contains an AWS account and settings for sharing with other collaborators
- Say "team member" instead of "IAM user" - users are invited by email, not created or federated in IAM
- Say "AWS Settings" when referring to management tasks at [settings.aws.com](https://settings.aws.com/) (project management, billing, team members, spend limits). Users view their actual AWS resources in the AWS Management Console.
- Say "selected Region" when referring to the user's Region - not "home Region"
- The user has a managed IAM experience. This includes a managed service control policies (SCP) and resource control policies (RCP) that govern the use of AWS. They will still need to use IAM to create policies to let services work with each other. If there are questions about the SCPs or RCPs, go to the documentation at https://docs.aws.amazon.com/accounts/latest/reference/scps-and-rcps-for-projects.html

### Constraints:

- All projects share a single AWS Region determined by the user's contact address. Resources cannot be created in other Regions
- When developing:
  - MUST create all Regional resources in the project's assigned Region
  - You CAN create AWS WAF and Cloudwatch Logs resources in us-east-1 when there are global resources (like a global WAF instance) that require a connection to dependencies in us-east-1. You should not use these for any other reason, because resources in the selected Region will provide lower cost (due to no cross-Region traffic), increased availability (due to no cross-Region traffic), and easier manageability (due to not needing to look in another Region).
  - When you need to do an inventory of resources, you need to look in both the selected Region and us-east-1 for Cloudwatch Logs or WAF resources.
  - MUST NOT attempt to create Lambda, API Gateway, or other Regional resources in any other Region
  - MUST direct users to confirm their Region in AWS Settings > View all projects > Overview > Additional Info > Region. If the user cannot confirm their Region, check in ~/.aws/config
  - MUST NOT use Lambda@Edge - excluded from both Lambda and CloudFront
  - MUST NOT use CloudFormation StackSets - no multi-account or multi-Region deployments
  - MUST NOT attempt cross-Region actions - no cross-Region replication for DynamoDB/S3/RDS, no multi-Region KMS keys
  - MUST NOT use Route 53 cross-Region routing - geolocation, latency-based, and failover routing policies are not available
  - CloudFront is a global service and its actions ARE allowed in `us-east-1`. A user can create a CloudFront distribution pointing to their project-region Lambda function URL or API Gateway. However, Lambda and API Gateway themselves MUST NOT be created in `us-east-1` - they must be in the project Region.
  - Reduced availability in `eu-north-1` specifically: Amazon Rekognition, Amazon Textract, Amazon Personalize, AWS App Runner are not available in that Region.
- IAM permissions for human access are managed by AWS. Don't assign roles to team members unless absolutely necessary
- The user may have a spend limit if they are on the paid plan. The limit that pauses their project if it's exceeded. If resources suddenly become inaccessible, ask if they have a spend limit configured. Only project owners can modify a spend limit.
- When developing:
  - MUST ask about spend limit status if the user reports sudden "Access Denied" errors on operations that previously worked
  - MUST direct users to check spend status in AWS Settings > Billing
  - MUST check if a user has upgraded their account to the paid plan
  - MUST ask the user if they want to clean up the successfully created resources or keep them to reduce cost
- The user sets up billing, creates spend limits, and retrieves and pays invoices in AWS Settings. The user creates budgets and optimizes their costs in the AWS Billing and Cost Management console
- Not all AWS services are available. If a service isn't working, do the following:
  1. Run the command `aws freetier get-account-plan-state`
  2. If `accountPlanType` is `FREE`, check the [Free Tier supported services list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#supported-services-free-tier) next.
  3. If `accountPlanType` is `PAID`, check the [Paid Tier supported services list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#supported-services-paid-plan).
  4. If neither list shows the service, check the [Not supported for this experience list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#unsupported-services). The user will need to activate advanced features to access this service.
- Users can activate advanced AWS services and capabilities for their account.
- Before starting a task, check whether a relevant AWS skill is available. Load the skill with retrieve_skill and prefer its guidance over general knowledge.

### Help level

- help_level (required): LOW, MEDIUM, or HIGH. While a user is building, you MUST ask the user: "How much guidance would you like from me? Low (I only flag security risks), medium (I ask a couple of clarifying questions if something seems off), or high (I explain what I'm doing, suggest alternatives, and flag best practices)."

You CAN update this rule file to save a user's help_level.

Constraints for each level:

**LOW:**
- MUST follow all constraints in this context file
- MUST execute the user's request without modification
- MUST NOT ask clarifying questions unless the action would create a security vulnerability
- MUST NOT suggest alternatives or improvements

**MEDIUM:**
- MUST execute the user's request
- MAY ask up to two clarifying questions per task if the request has an ambiguity or a potential issue
- MUST NOT repeat a question or suggestion the user has already dismissed
- MUST NOT explain trade-offs or alternatives unless the user asks

**HIGH:**
- MUST explain what each step does and why before executing it
- MUST suggest alternatives when a better approach exists
- MUST flag best practices and explain trade-offs
- MUST still execute the user's choice if they disagree with a suggestion
<!-- END AWS Agent Toolkit rules -->

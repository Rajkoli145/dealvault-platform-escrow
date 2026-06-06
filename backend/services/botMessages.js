/**
 * Bot Message Templates
 *
 * Markdown templates for DealVault Bot comments on GitHub issues.
 * Each function returns a formatted markdown string ready to be posted.
 */

const PLATFORM_BASE_URL = () => process.env.PLATFORM_BASE_URL || 'http://localhost:3000';

// ── Message Templates ─────────────────────────────────────────────────────────

/**
 * Message when an issue is added to the DealVault platform (label applied).
 * @param {object} opts
 * @param {number} opts.issueNumber
 * @param {string} opts.repoFullName
 * @param {number} [opts.funding] – Dollar amount (0 = not set)
 * @param {string} [opts.fundingCurrency]
 * @returns {string} Markdown comment body
 */
function issueAddedMessage({ issueNumber, repoFullName, funding = 0, fundingCurrency = 'USD' }) {
  const applyUrl = `${PLATFORM_BASE_URL()}/issues/${repoFullName}/${issueNumber}/apply`;

  const fundingLine =
    funding > 0
      ? `This issue is funded at **$${funding} ${fundingCurrency}** 💰\n\n`
      : '';

  return [
    `This issue has been added to the **[DealVault Platform](${PLATFORM_BASE_URL()})** 🏦`,
    '',
    fundingLine.trim(),
    `🧑‍💻 **Interested in contributing?** [Apply to work on this issue on DealVault](${applyUrl}), earn recognition, and build your contributor profile.`,
    '',
    `> ⚠️ **Note:** Issues will only be assigned to contributors who apply through the DealVault platform. Please do not request assignment in the comments.`,
    '',
    `🔗 [Learn more about DealVault](${PLATFORM_BASE_URL()})`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Message when a contributor applies to work on an issue.
 * @param {object} opts
 * @param {string} opts.applicantUsername – GitHub username
 * @param {string} opts.applicationLetter – The application text
 * @param {number} opts.issueNumber
 * @param {string} opts.repoFullName
 * @returns {string} Markdown comment body
 */
function applicationReceivedMessage({ applicantUsername, applicationLetter, issueNumber, repoFullName }) {
  const reviewUrl = `${PLATFORM_BASE_URL()}/issues/${repoFullName}/${issueNumber}/applications`;

  return [
    `**@${applicantUsername}** has applied to work on this issue as part of the **DealVault Platform**.`,
    '',
    `> ${applicationLetter.split('\n').join('\n> ')}`,
    '',
    `📋 **Repo Maintainers:** To accept this application, [review their application](${reviewUrl}) or assign @${applicantUsername} to this issue.`,
  ].join('\n');
}

/**
 * Message when a maintainer confirms/accepts an application.
 * @param {object} opts
 * @param {string} opts.applicantUsername – GitHub username
 * @param {number} opts.issueNumber
 * @param {string} opts.repoFullName
 * @param {string} opts.issueUrl – Full GitHub issue URL
 * @returns {string} Markdown comment body
 */
function applicationConfirmedMessage({ applicantUsername, issueNumber, repoFullName, issueUrl }) {
  const manageUrl = `${PLATFORM_BASE_URL()}/issues/${repoFullName}/${issueNumber}`;

  return [
    `Congratulations, **@${applicantUsername}**! 🎉 Your application was accepted by the repo's maintainers.`,
    '',
    `🔒 **@${applicantUsername}:** Please resolve the issue. You'll earn recognition and build your contributor profile on DealVault.`,
    '',
    `> ⚠️ **Warning**`,
    `> When opening a PR, please [link it to this issue](${issueUrl}) to ensure it gets tracked accurately.`,
    '',
    `🧑‍💼 **Repo maintainers:** Please keep an eye on the contributor's progress and review their work. You can manage this issue [here](${manageUrl}).`,
    '',
    `🏦 Happy Building 🏦`,
  ].join('\n');
}

/**
 * Message when a maintainer rejects an application.
 * @param {object} opts
 * @param {string} opts.applicantUsername
 * @param {string} [opts.reason]
 * @returns {string}
 */
function applicationRejectedMessage({ applicantUsername, reason }) {
  const reasonLine = reason
    ? `\n\n**Reason:** ${reason}`
    : '';

  return [
    `Hi **@${applicantUsername}**, thank you for your interest in this issue.`,
    '',
    `Unfortunately, your application was not accepted at this time.${reasonLine}`,
    '',
    `Feel free to apply for other issues on the **[DealVault Platform](${PLATFORM_BASE_URL()})**. 💪`,
  ].join('\n');
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  issueAddedMessage,
  applicationReceivedMessage,
  applicationConfirmedMessage,
  applicationRejectedMessage,
};

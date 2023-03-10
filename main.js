const core = require('@actions/core')
const { Octokit } = require('@octokit/core')
const { paginateRest } = require('@octokit/plugin-paginate-rest')

async function main() {
  try {
    const owner = core.getInput('owner')
    const repo = core.getInput('repo')
    const token = core.getInput('github-token', { required: true })
    const pull_number = core.getInput('pull_number')

    const MyOctokit = Octokit.plugin(paginateRest)
    const octokit = new MyOctokit({ auth: 'token ' + token })
    core.info(`Checking Status of ${owner}/${repo}/${pull_number}`)
    const result = await octokit.paginate('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
      owner: owner,
      repo: repo,
      pull_number: pull_number,
      per_page: 100,
    })

    core.setOutput('mergeableState', result[0].mergeable_state)
    core.info(result[0].mergeable_state)
    core.info(JSON.stringify(result, null, 2))
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()

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
    core.info(owner)
    core.info(repo)
    core.info(pull_number)
    const url = `/repos/${owner}/${repo}/pulls/${pull_number}`
    core.info(url)
    const result = await octokit.paginate('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
      owner: 'cogitorteam',
      repo: 'helm',
      pull_number: '79',
      per_page: 100,
    })
    core.info(JSON.stringify(result))
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()

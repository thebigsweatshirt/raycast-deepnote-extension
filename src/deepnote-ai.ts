import { showToast, Toast, open } from "@raycast/api"

type Props = {
  arguments: {
    prompt: string
  }
}

export default async function RunDeepnoteAiCommand(props: Props) {
  console.log(props)

  const { prompt } = props.arguments

  if (!prompt) {
    showToast(Toast.Style.Failure, "Prompt is missing")
    return
  }

  const notebookUrl =
    "https://ra-15422.deepnote-staging.com/workspace/deepnote-b29c5ffe-318b-4d24-9726-ff78fc714ef2/project/Deepnote-AI-8e824e62-aa97-47df-875c-70f9e16e67cf/notebook/70b60195729a4a4f9aaaab2524ddaaf3"

  const searchParams = new URLSearchParams()

  searchParams.append("__prompt", prompt)

  const url = `${notebookUrl}?${searchParams.toString()}`

  try {
    await open(url)
  } catch (error) {
    showToast(Toast.Style.Failure, "Failed to open URL")
  }
}

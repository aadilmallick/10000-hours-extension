// Utility for syncing JSON data to a GitHub Gist using a PAT and Gist ID

export async function uploadToGist({
  gistId,
  filename,
  content,
  token,
}: {
  gistId: string;
  filename: string;
  content: string;
  token: string;
}) {
  const trimmedGistId = gistId.trim();
  const trimmedToken = token.trim();
  if (!trimmedGistId || !trimmedToken) {
    throw new Error("Gist ID and token cannot be empty");
  }
  const url = `https://api.github.com/gists/${trimmedGistId}`;
  const body = {
    files: {
      [filename]: { content },
    },
  };
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${trimmedToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to upload to Gist: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

export async function downloadFromGist({
  gistId,
  filename,
  token,
}: {
  gistId: string;
  filename: string;
  token: string;
}) {
  const trimmedGistId = gistId.trim();
  const trimmedToken = token.trim();
  if (!trimmedGistId || !trimmedToken) {
    throw new Error("Gist ID and token cannot be empty");
  }
  const url = `https://api.github.com/gists/${trimmedGistId}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${trimmedToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Gist: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.files || !data.files[filename] || !data.files[filename].content) {
    throw new Error("File not found in Gist");
  }
  return data.files[filename].content;
}

import { List, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { useAuth } from "./utils/auth";
import fetch from "node-fetch";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  isTemplate: boolean;
  updatedAt: string | null;
  url: string;
}

export default function SearchProjects() {
  const { isAuthenticated, apiKey } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (isAuthenticated && apiKey) {
      fetchProjects(apiKey);
    }
  }, [isAuthenticated, apiKey]);

  async function fetchProjects(key: string) {
    setIsLoading(true);
    try {
      const response = await fetch("https://api-ra-15422.deepnote-staging.com/v1/projects", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToast(Toast.Style.Failure, "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search projects..."
    >
      {filteredProjects.map((project) => (
        <List.Item
          key={project.id}
          title={project.name}
          subtitle={`Created: ${new Date(project.createdAt).toLocaleDateString()}`}
          accessories={[
            { text: project.isTemplate ? "Template" : "Project" },
            { text: project.updatedAt ? `Updated: ${new Date(project.updatedAt).toLocaleDateString()}` : "" },
          ]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={project.url} />
              <Action.CopyToClipboard
                title="Copy Project ID"
                content={project.id}
                shortcut={{ modifiers: ["cmd"], key: "." }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

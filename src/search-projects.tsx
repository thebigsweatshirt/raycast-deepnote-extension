import { List, ActionPanel, Action, showToast, Toast, Icon, Color, Image } from "@raycast/api";
import { useState, useEffect } from "react";
import { useAuth } from "./utils/auth";
import fetch from "node-fetch";

interface Author {
  avatar: string;
  email: string;
  id: string;
  lastName: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  createdAt: string;
  isTemplate: boolean;
  hasDataApp: boolean;
  updatedAt: string | null;
  url: string;
  lastAccessedAt: string;
  author: Author;
  dataAppUrl: string;
  isFavorite: boolean;
  slug: string;
}

export default function SearchProjects() {
  const { isAuthenticated, apiKey } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isAuthenticated && apiKey) {
      fetchProjects(apiKey);
    }
  }, [isAuthenticated, apiKey]);

  useEffect(() => {
    filterProjects(filter);
  }, [projects, filter]);

  async function fetchProjects(key: string) {
    setIsLoading(true);
    try {
      const response = await fetch("https://api-ra-15422.deepnote-staging.com/v1/projects", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json() as { projects: Project[] };
      setProjects(data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToast(Toast.Style.Failure, "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  }

  function filterProjects(filterValue: string) {
    switch (filterValue) {
      case "favorites":
        setFilteredProjects(projects.filter(p => p.isFavorite));
        break;
      case "dataapp":
        setFilteredProjects(projects.filter(p => p.hasDataApp));
        break;
      case "template":
        setFilteredProjects(projects.filter(p => p.isTemplate));
        break;
      default:
        setFilteredProjects(projects);
    }
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search projects..."
      filtering={{
        keepSectionOrder: true,
      }}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter Projects"
          storeValue={true}
          onChange={(newValue) => setFilter(newValue)}
        >
          <List.Dropdown.Item title="All Projects" value="all" />
          <List.Dropdown.Item title="Favorites" value="favorites" />
          <List.Dropdown.Item title="Data Apps" value="dataapp" />
          <List.Dropdown.Item title="Templates" value="template" />
        </List.Dropdown>
      }
    >
      <List.Section title="Projects" subtitle={filteredProjects.length.toString()}>
        {filteredProjects.map((project) => (
          <ProjectListItem key={project.id} project={project} />
        ))}
      </List.Section>
    </List>
  );
}

function ProjectListItem({ project }: { project: Project }) {
  const lastAccessedDate = new Date(project.lastAccessedAt);
  const formattedDate = lastAccessedDate.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit'
  });
  
  const formattedTooltipDate = lastAccessedDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const authorName = `${project.author.name} ${project.author.lastName}`.trim();

  const accessories: List.Item.Accessory[] = [];

  if (project.isFavorite) {
    accessories.push({ 
      icon: { source: Icon.Star, tintColor: Color.Yellow },
      tooltip: "Project is favorited" 
    });
  }
  if (project.hasDataApp) {
    accessories.push({ 
      icon: { source: Icon.BarChart, tintColor: Color.Blue },
      tooltip: "Project is a data app" 
    });
  }
  if (project.isTemplate) {
    accessories.push({ 
      icon: { source: Icon.Duplicate, tintColor: Color.Purple },
      tooltip: "Project is a template" 
    });
  }

  accessories.push({
    icon: { source: Icon.Calendar, tintColor: Color.SecondaryText },
    text: formattedDate,
    tooltip: `Last accessed: ${formattedTooltipDate}`
  });

  accessories.push({
    icon: { source: project.author.avatar, mask: Image.Mask.Circle },
    tooltip: `Author: ${authorName}`
  });

  return (
    <List.Item
      title={project.name}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={project.hasDataApp ? project.dataAppUrl : project.url} />
          <Action.CopyToClipboard
            title="Copy Project URL"
            content={project.url}
            shortcut={{ modifiers: ["cmd"], key: "u" }}
          />
          <Action.CopyToClipboard
            title="Copy Project ID"
            content={project.id}
            shortcut={{ modifiers: ["cmd"], key: "." }}
          />
        </ActionPanel>
      }
      keywords={[
        project.isTemplate ? "template" : "project",
        project.hasDataApp ? "dataapp" : "",
        project.isFavorite ? "favorite" : "",
      ]}
    />
  );
}

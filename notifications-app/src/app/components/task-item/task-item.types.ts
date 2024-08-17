export interface TaskDTO {
  id: string | undefined;
  title: string;
  description: string;
  completed: boolean;
}

export interface ToggleTaskDTO {
  status: boolean;
}
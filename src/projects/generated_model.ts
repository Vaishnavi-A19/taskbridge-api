// GENERATED MODEL (UNREVIEWED)
export interface ProjectModel {
  id: string;
  title: string;
  data: any;
}

export function newProject(id: string, title: string){
  return { id, title, data: {} } as ProjectModel;
}

export interface INote {
  title: string;
  comment: string;
  created_by: ICreatedBy;
  created_at: string;
  interview: IInterview;
  start_time: number;
  end_time: number;
  id: number;
  labels: any[];
  subtitle: string;
}

export interface ICreatedBy {
  name: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface IInterview {
  name: string;
  id: number;
  url: string;
}

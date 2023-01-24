/**
 * Note Object as stored in the db
 */
export interface INote {
  /**
   * Title of the note, can a question
   */
  name: string;
  /**
   * Description of the note
   */
  description: string;
  /**
   * Creator details
   */
  created_by: ICreatedBy;
  /**
   * Time of creation
   */
  created_at: string;
  /**
   * Interview Details
   */
  interview: IInterview;
  /**
   * Interview start time
   */
  start_time: number;
  /**
   * Interview end time
   */
  end_time: number;
  /**
   * Unique id for the note
   */
  event_class: unknown;
  /**
   * List of labels
   */
  labels: any[];
  /**
   * Transcription subtitle
   */
  subtitle: string;
  /**
   * Variant of the note
   */
  variant?: string;
  /**
   * Wav file details
   **/
  wav: any;
  /**
   * Author of the note
   * */
  author: string;

  /**
   * Thumbnail url
   * */
  thumbnail_url: string;

  /**
   * Color of the note
   * */
  color: string;
}

/**
 * Created by object as stored in db
 */
export interface ICreatedBy {
  /**
   * Name of the user who created the note
   */
  name: string;
  /**
   * First name of the user
   */
  first_name: string;
  /**
   * Last name of the user
   */
  last_name: string;
  /**
   * Avatar pic url
   */
  avatar: string;
}

/**
 * Interview object
 */
export interface IInterview {
  /**
   * Name of the interview
   */
  name: string;
  /**
   * Interview Id
   */
  id: number;
  /**
   * Interview url
   */
  url: string;
}

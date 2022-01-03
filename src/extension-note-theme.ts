import { css } from '@linaria/core';

export const NOTE_ROOT = css`
  background-color: rgba(247, 246, 249, 0.5);
  border: 1px solid #edeff2;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 12px;
  margin: 4px 80px;
` as 'remirror-note-root';

export const NOTE_TITLE = css`
  font-size: 13px;
  font-weight: 600;
  line-height: 15px;
  display: flex;
  align-items: center;
  color: #262c3d;
  margin-bottom: 4px !important;
` as 'remirror-note-title';

export const NOTE_DESCRIPTION = css`
  font-size: 13px;
  line-height: 15px;
  display: flex;
  align-items: center;
  color: #262c3d;
  margin-bottom: 12px !important;
` as 'remirror-note-description';

export const NOTE_FOOTER_WRAPPER = css`
  display: flex;
  align-items: center;
  gap: 24px;
` as 'remirror-note-footer-wrapper';

export const NOTE_DURATION = css`
  font-size: 11px;
  line-height: 13px;
  display: flex;
  align-items: center;
  color: #8c95a8;
  margin-right: 28px !important;
` as 'remirror-note-duration';

export const NOTE_INTERVIEW_NAME = css`
  font-size: 11px;
  line-height: 13px;
  display: flex;
  align-items: center;
  color: #8c95a8;
` as 'remirror-note-interview-name';

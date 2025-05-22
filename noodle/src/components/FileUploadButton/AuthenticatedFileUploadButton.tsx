import * as React from 'react';
import { FileUploadButton, FileUploadButtonProps } from './FileUploadButton';
import { withComponentAuth } from '../BasicAuth/BasicAuth';

/**
 * A version of FileUploadButton that requires authentication before use
 */
export const AuthenticatedFileUploadButton = withComponentAuth(FileUploadButton);

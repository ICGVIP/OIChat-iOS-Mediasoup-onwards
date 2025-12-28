import {
  Participant, Stream, DispStreamsType, DispStreamsParameters,
} from '../@types/types';

export interface GeneratePageContentParameters extends DispStreamsParameters {
  paginatedStreams: (Participant | Stream)[][];
  currentUserPage: number;
  updateMainWindow: boolean;
  updateCurrentUserPage: (page: number) => void;
  updateUpdateMainWindow: (flag: boolean) => void;

  // mediasfu functions
  dispStreams: DispStreamsType;
  getUpdatedAllParams: () => GeneratePageContentParameters;
  [key: string]: any;
}

export interface GeneratePageContentOptions {
  page: number | string;
  parameters: GeneratePageContentParameters;
  breakRoom?: number;
  inBreakRoom?: boolean;
}

// Export the type definition for the function
export type GeneratePageContentType = (options: GeneratePageContentOptions) => Promise<void>;

/**
 * Generates the content for a specific page.
 *
 * @param {GeneratePageContentOptions} options - The options for generating page content.
 * @param {number | string} options.page - The page number to generate content for.
 * @param {GeneratePageContentParameters} options.parameters - The parameters required for generating content.
 * @param {Array} options.parameters.paginatedStreams - The streams to be paginated.
 * @param {number} options.parameters.currentUserPage - The current page of the user.
 * @param {Function} options.parameters.updateMainWindow - Function to update the main window flag.
 * @param {Function} options.parameters.updateCurrentUserPage - Function to update the current user page.
 * @param {Function} options.parameters.updateUpdateMainWindow - Function to update the main window update flag.
 * @param {Function} options.parameters.dispStreams - Function to display streams for the specified page.
 * @param {number} [options.breakRoom=-1] - The break room identifier.
 * @param {boolean} [options.inBreakRoom=false] - Flag indicating if the user is in a break room.
 * 
 * @returns {Promise<void>} A promise that resolves when the content generation is complete.
 * 
 * @throws {Error} Throws an error if content generation fails.
 * 
 * @example
 * const options = {
 *   page: 1,
 *   parameters: {
 *     paginatedStreams: [[stream1, stream2], [stream3, stream4]], // Example paginated streams
 *     currentUserPage: 0,
 *     updateMainWindow: true,
 *     updateCurrentUserPage: (page) => console.log('Current user page updated to:', page),
 *     updateUpdateMainWindow: (flag) => console.log('Main window update flag:', flag),
 *     dispStreams: async ({ lStreams, ind }) => {
 *       console.log(`Displaying streams for page ${ind}:`, lStreams);
 *     },
 *   },
 *   breakRoom: 1,
 *   inBreakRoom: false,
 * };
 * 
 * generatePageContent(options)
 *   .then(() => {
 *     console.log('Page content generated successfully');
 *   })
 *   .catch((error) => {
 *     console.error('Error generating page content:', error);
 *   });
 */

export async function generatePageContent({
  page,
  parameters,
  breakRoom = -1,
  inBreakRoom = false,
}: GeneratePageContentOptions): Promise<void> {
  try {
    // Destructure parameters
    let {
      paginatedStreams,
      currentUserPage,
      updateMainWindow,

      updateCurrentUserPage,
      updateUpdateMainWindow,

      // mediasfu functions
      dispStreams,
    } = parameters;

    // Convert page to an integer
    page = typeof page === 'string' ? parseInt(page) : page;

    // Update current user page
    currentUserPage = page;
    updateCurrentUserPage(currentUserPage);

    // Update main window flag
    updateMainWindow = true;
    updateUpdateMainWindow(updateMainWindow);

    // Display streams for the specified page
    await dispStreams({
      lStreams: paginatedStreams[page],
      ind: page,
      parameters,
      breakRoom,
      inBreakRoom,
    });
  } catch (error) {
    // Handle errors during content generation
    if (error instanceof Error) {
      console.log('Error generating page content:', error.message);
    } else {
      console.log('Error generating page content:', error);
    }
  }
}

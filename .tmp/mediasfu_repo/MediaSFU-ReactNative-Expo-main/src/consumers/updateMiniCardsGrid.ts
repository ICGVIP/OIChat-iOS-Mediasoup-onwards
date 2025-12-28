import { GridSizes, ComponentSizes, EventType } from '../@types/types';

export interface UpdateMiniCardsGridParameters {
  updateGridRows: (rows: number) => void;
  updateGridCols: (cols: number) => void;
  updateAltGridRows: (rows: number) => void;
  updateAltGridCols: (cols: number) => void;
  updateGridSizes: (gridSizes: GridSizes) => void;
  gridSizes: GridSizes;
  paginationDirection: string;
  paginationHeightWidth: number;
  doPaginate: boolean;
  componentSizes: ComponentSizes;
  eventType: EventType;

  getUpdatedAllParams: () => UpdateMiniCardsGridParameters;
  [key: string]: any;
}

export interface UpdateMiniCardsGridOptions {
  rows: number;
  cols: number;
  defal?: boolean;
  actualRows?: number;
  parameters: UpdateMiniCardsGridParameters;
}

// Export the type definition for the function
export type UpdateMiniCardsGridType = (options: UpdateMiniCardsGridOptions) => Promise<void>;

/**
 * Updates the mini cards grid based on the specified rows and columns.
 *
 * @param {UpdateMiniCardsGridOptions} options - The function parameters.
 * @param {number} options.rows - The number of rows in the grid.
 * @param {number} options.cols - The number of columns in the grid.
 * @param {boolean} [options.defal] - Flag indicating whether to update the default grid or an alternative grid.
 * @param {number} [options.actualRows] - The actual number of rows in the grid.
 * @param {UpdateMiniCardsGridParameters} options.parameters - Additional parameters needed for the function.
 * @returns {Promise<void>} A promise that resolves when the mini cards grid is updated.
 *
 * @throws Will throw an error if the update operation fails.
 *
 * @example
 * ```typescript
 * const options = {
 *   rows: 2,
 *   cols: 3,
 *   defal: true,
 *   actualRows: 2,
 *   parameters: {
 *     updateGridRows: updateGridRowsFunction,
 *     updateGridCols: updateGridColsFunction,
 *     updateAltGridRows: updateAltGridRowsFunction,
 *     updateAltGridCols: updateAltGridColsFunction,
 *     updateGridSizes: updateGridSizesFunction,
 *     gridSizes: { gridWidth: 100, gridHeight: 100 },
 *     paginationDirection: 'horizontal',
 *     paginationHeightWidth: 50,
 *     doPaginate: true,
 *     componentSizes: { otherWidth: 300, otherHeight: 200 },
 *     eventType: 'chat',
 *     getUpdatedAllParams: getUpdatedAllParamsFunction,
 *   },
 * };
 * 
 * await updateMiniCardsGrid(options);
 * ```
 */

export async function updateMiniCardsGrid({
  rows,
  cols,
  defal = true,
  actualRows = 2,
  parameters,
}: UpdateMiniCardsGridOptions): Promise<void> {
  const { getUpdatedAllParams } = parameters;

  parameters = getUpdatedAllParams();

  let {
    updateGridRows,
    updateGridCols,
    updateAltGridRows,
    updateAltGridCols,
    updateGridSizes,

    gridSizes,
    paginationDirection,
    paginationHeightWidth,
    doPaginate,
    componentSizes,
    eventType,
  } = parameters;

  let containerWidth = componentSizes.otherWidth;
  let containerHeight = componentSizes.otherHeight;

  if (doPaginate) {
    // Adjust container size based on pagination
    if (paginationDirection === 'horizontal') {
      containerHeight -= paginationHeightWidth;
    } else {
      containerWidth -= paginationHeightWidth;
    }
  }

  let cardSpacing = 3; // 3px margin between cards
  if (eventType === 'chat') {
    cardSpacing = 0;
  }

  const totalSpacingHorizontal = (cols - 1) * cardSpacing;
  const totalSpacingVertical = (actualRows - 1) * cardSpacing;

  let cardWidth: number;
  let cardHeight: number;

  if (cols === 0 || actualRows === 0) {
    cardWidth = 0;
    cardHeight = 0;
  } else {
    cardWidth = Math.floor(
      (containerWidth - totalSpacingHorizontal) / cols,
    );
    cardHeight = Math.floor(
      (containerHeight - totalSpacingVertical) / actualRows,
    );
  }

  if (defal) {
    updateGridRows(rows);
    updateGridCols(cols);

    gridSizes = { ...gridSizes, gridWidth: cardWidth, gridHeight: cardHeight };
    updateGridSizes(gridSizes);
  } else {
    updateAltGridRows(rows);
    updateAltGridCols(cols);

    gridSizes = {
      ...gridSizes,
      altGridWidth: cardWidth,
      altGridHeight: cardHeight,
    };
    updateGridSizes(gridSizes);
  }
}

import React from 'react';
import {
  FlatList,
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import { Socket } from 'socket.io-client';
import { generatePageContent, GeneratePageContentOptions, GeneratePageContentParameters } from '../../consumers/generatePageContent';
import { ShowAlert, BreakoutParticipant } from '../../@types/types';

/**
 * Interface defining the parameters required by the Pagination component.
 * Extends GeneratePageContentParameters for full page content generation functionality.
 * 
 * @interface PaginationParameters
 * 
 * **Room Context:**
 * @property {number} mainRoomsLength - Total number of main rooms
 * @property {number} memberRoom - Current room number of the member
 * @property {number} hostNewRoom - Host's current room number
 * @property {string} roomName - Name/ID of the current room
 * @property {string} member - Current user's member ID/name
 * 
 * **Breakout Room State:**
 * @property {boolean} breakOutRoomStarted - Whether breakout rooms have started
 * @property {boolean} breakOutRoomEnded - Whether breakout rooms have ended
 * @property {BreakoutParticipant[][]} breakoutRooms - Array of breakout room participant groups
 * 
 * **User Context:**
 * @property {string} islevel - User's level/role ('0'=participant, '1'=moderator, '2'=host)
 * @property {Socket} socket - Socket.io client for real-time communication
 * @property {ShowAlert} [showAlert] - Function to display alerts/notifications
 * 
 * **Utility:**
 * @property {() => PaginationParameters} getUpdatedAllParams - Get latest parameter state
 */
export interface PaginationParameters extends GeneratePageContentParameters {
  mainRoomsLength: number;
  memberRoom: number;
  breakOutRoomStarted: boolean;
  breakOutRoomEnded: boolean;
  member: string;
  breakoutRooms: BreakoutParticipant[][];
  hostNewRoom: number;
  roomName: string;
  islevel: string;
  showAlert?: ShowAlert;
  socket: Socket;

  // Function to get updated parameters
  getUpdatedAllParams: () => PaginationParameters;
  [key: string]: any;
}

/**
 * Interface defining the options for the Pagination component.
 * 
 * @interface PaginationOptions
 * 
 * **Pagination State:**
 * @property {number} totalPages - Total number of pages available
 * @property {number} currentUserPage - Current page number the user is viewing (1-indexed)
 * @property {(options: GeneratePageContentOptions) => Promise<void>} [handlePageChange]
 *   Function to handle page changes (default: generatePageContent)
 * 
 * **Layout & Positioning:**
 * @property {"left" | "middle" | "right"} [position="middle"] - Horizontal alignment
 * @property {"top" | "middle" | "bottom"} [location="middle"] - Vertical alignment
 * @property {"horizontal" | "vertical"} [direction="horizontal"] - Pagination button layout direction
 * @property {number} [paginationHeight=40] - Height of the pagination container in pixels
 * @property {boolean} [showAspect=true] - Whether to display the pagination component
 * 
 * **Styling:**
 * @property {string} [backgroundColor="#ffffff"] - Background color of pagination container
 * @property {StyleProp<ViewStyle>} [buttonsContainerStyle] - Custom styles for buttons container
 * @property {StyleProp<ViewStyle>} [activePageStyle] - Custom styles for active page button
 * @property {StyleProp<ViewStyle>} [inactivePageStyle] - Custom styles for inactive page buttons
 * @property {object} [style] - Additional custom styles for container
 * 
 * **State Parameters:**
 * @property {PaginationParameters} parameters - Pagination context and breakout room parameters
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContent]
 *   Function to wrap or replace pagination content
 * @property {(options: { defaultContainer: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace pagination container
 */
export interface PaginationOptions {
  totalPages: number;
  currentUserPage: number;
  handlePageChange?: (options: GeneratePageContentOptions) => Promise<void>;
  position?: 'left' | 'middle' | 'right';
  location?: 'top' | 'middle' | 'bottom';
  direction?: 'horizontal' | 'vertical';
  buttonsContainerStyle?: StyleProp<ViewStyle>;
  activePageStyle?: StyleProp<ViewStyle>;
  inactivePageStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  paginationHeight?: number;
  showAspect?: boolean;
  parameters: PaginationParameters;

  /**
   * Optional custom style to apply to the container.
   */
  style?: object;

  /**
   * Optional function to render custom content, receiving the default content and dimensions.
   */
  renderContent?: (options: {
    defaultContent: React.ReactNode;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;

  /**
   * Optional function to render a custom container, receiving the default container and dimensions.
   */
  renderContainer?: (options: {
    defaultContainer: React.ReactNode;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;
}

/**
 * Interface for individual page items.
 */
interface PageItem {
  id: string;
  number: number;
}

export type PaginationType = (options: PaginationOptions) => JSX.Element;

/**
 * Pagination - Multi-page navigation with breakout room support
 * 
 * Pagination is a React Native component for navigating between multiple pages
 * of content (typically participant grids). It includes special logic for breakout
 * room scenarios where access to certain pages is restricted based on user role.
 * 
 * **Key Features:**
 * - Multi-page navigation with numbered buttons
 * - Breakout room access control
 * - Flexible layout positioning (top/middle/bottom, left/middle/right)
 * - Horizontal or vertical button arrangement
 * - Active page highlighting
 * - Host-specific room switching capabilities
 * - Customizable button styling
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.paginationComponent` to
 * provide a completely custom pagination implementation.
 * 
 * @component
 * @param {PaginationOptions} props - Configuration options for the Pagination component
 * 
 * @returns {JSX.Element} Rendered pagination controls
 * 
 * @example
 * // Basic usage - Simple page navigation
 * import React from 'react';
 * import { Pagination } from 'mediasfu-reactnative-expo';
 *
 * function VideoGridWithPagination() {
 *   const [currentPage, setCurrentPage] = React.useState(1);
 *   
 *   const paginationParams = {
 *     mainRoomsLength: 3,
 *     memberRoom: 1,
 *     breakOutRoomStarted: false,
 *     breakOutRoomEnded: false,
 *     member: 'user123',
 *     breakoutRooms: [],
 *     hostNewRoom: 0,
 *     roomName: 'MainRoom',
 *     islevel: '1',
 *     socket: socketInstance,
 *     getUpdatedAllParams: () => paginationParams,
 *   };
 *
 *   return (
 *     <Pagination
 *       totalPages={5}
 *       currentUserPage={currentPage}
 *       position="middle"
 *       location="bottom"
 *       direction="horizontal"
 *       backgroundColor="#ffffff"
 *       paginationHeight={40}
 *       parameters={paginationParams}
 *     />
 *   );
 * }
 * 
 * @example
 * // With custom styling and breakout rooms
 * <Pagination
 *   totalPages={10}
 *   currentUserPage={3}
 *   handlePageChange={async (options) => {
 *     console.log('Changing to page:', options.page);
 *     await generatePageContent(options);
 *   }}
 *   position="right"
 *   location="top"
 *   direction="vertical"
 *   buttonsContainerStyle={{ gap: 8 }}
 *   activePageStyle={{ backgroundColor: '#007bff', borderRadius: 8 }}
 *   inactivePageStyle={{ backgroundColor: '#e0e0e0', borderRadius: 8 }}
 *   backgroundColor="#f5f5f5"
 *   paginationHeight={50}
 *   showAspect={true}
 *   parameters={{
 *     ...paginationParams,
 *     breakOutRoomStarted: true,
 *     breakoutRooms: breakoutParticipantGroups,
 *     islevel: '2', // Host level
 *   }}
 * />
 * 
 * @example
 * // Using uiOverrides for complete pagination replacement
 * import { MyCustomPagination } from './MyCustomPagination';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     paginationComponent: {
 *       component: MyCustomPagination,
 *       injectedProps: {
 *         theme: 'minimal',
 *         showPageNumbers: true,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomPagination.tsx
 * export const MyCustomPagination = (props: PaginationOptions & { theme: string; showPageNumbers: boolean }) => {
 *   return (
 *     <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
 *       <Button title="Prev" onPress={() => props.handlePageChange?.({ page: props.currentUserPage - 1, parameters: props.parameters })} />
 *       {props.showPageNumbers && <Text>{props.currentUserPage} / {props.totalPages}</Text>}
 *       <Button title="Next" onPress={() => props.handlePageChange?.({ page: props.currentUserPage + 1, parameters: props.parameters })} />
 *     </View>
 *   );
 * };
 *     hostNewRoom: 2,
 *     roomName: 'Room A',
 *     islevel: '2',
 *     showAlert: (alert) => console.log(alert.message),
 *     socket: /* Socket connection * /,
 *     getUpdatedAllParams: () => parameters,
 *   };

 *   return (
 *     <Pagination
 *       totalPages={10}
 *       currentUserPage={1}
 *       parameters={parameters}
 *       backgroundColor="lightgray"
 *       paginationHeight={50}
 *       direction="horizontal"
 *       position="middle"
 *       location="bottom"
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const Pagination: React.FC<PaginationOptions> = ({
  totalPages,
  currentUserPage,
  handlePageChange = generatePageContent,
  position = 'middle',
  location = 'middle',
  direction = 'horizontal',
  activePageStyle = { backgroundColor: '#2c678f' },
  inactivePageStyle,
  backgroundColor = '#ffffff',
  paginationHeight = 40,
  showAspect = true,
  parameters,
  style,
  renderContent,
  renderContainer,
}) => {
  // Update parameters using the provided function
  const { getUpdatedAllParams } = parameters;
  const updatedParameters = getUpdatedAllParams();
  const {
    mainRoomsLength,
    memberRoom,
    breakOutRoomStarted,
    breakOutRoomEnded,
    member,
    breakoutRooms,
    hostNewRoom,
    roomName,
    islevel,
    showAlert,
    socket,
  } = updatedParameters;

  // Generate data for FlatList
  const data: PageItem[] = Array.from({ length: totalPages + 1 }, (_, index) => ({
    id: `${index}`,
    number: index,
  }));

  /**
   * Handles the page button click.
   *
   * @param {number} page - The page number that was clicked.
   */
  const onPagePress = async (page: number) => {
    if (page === currentUserPage) {
      return;
    }

    if (breakOutRoomStarted && !breakOutRoomEnded && page !== 0) {
      const roomMember = breakoutRooms.find((r) => r.find((p) => p.name === member));
      const pageInt = page - mainRoomsLength;
      let memberBreakRoom = -1;
      if (roomMember) {
        memberBreakRoom = breakoutRooms.indexOf(roomMember);
      }

      if (
        (memberBreakRoom === -1 || memberBreakRoom !== pageInt)
        && pageInt >= 0
      ) {
        if (islevel !== '2') {
          if (showAlert) {
            showAlert({
              message: `You are not part of the breakout room ${pageInt + 1}.`,
              type: 'danger',
            });
          }
          return;
        }

        await handlePageChange({
          page,
          parameters: updatedParameters,
          breakRoom: pageInt,
          inBreakRoom: true,
        });

        if (hostNewRoom !== pageInt) {
          socket.emit(
            'updateHostBreakout',
            { newRoom: pageInt, roomName },
            () => {},
          );
        }
      } else {
        await handlePageChange({
          page,
          parameters: updatedParameters,
          breakRoom: pageInt,
          inBreakRoom: pageInt >= 0,
        });

        if (islevel === '2' && hostNewRoom !== -1) {
          socket.emit(
            'updateHostBreakout',
            { prevRoom: hostNewRoom, newRoom: -1, roomName },
            () => {},
          );
        }
      }
    } else {
      await handlePageChange({
        page,
        parameters: updatedParameters,
        breakRoom: 0,
        inBreakRoom: false,
      });

      if (islevel === '2' && hostNewRoom !== -1) {
        socket.emit(
          'updateHostBreakout',
          { prevRoom: hostNewRoom, newRoom: -1, roomName },
          () => {},
        );
      }
    }
  };

  /**
   * Renders each page item.
   *
   * @param {PageItem} item - The page item to render.
   * @returns {JSX.Element} The rendered page button.
   */
  const renderItem = ({ item }: { item: PageItem }) => {
    const isActive = item.number === currentUserPage;
    const pageStyle = isActive ? [styles.activePage, activePageStyle] : [styles.inactivePage, inactivePageStyle];

    let displayItem: React.ReactNode = item.number;
    const targetPage = memberRoom;

    if (breakOutRoomStarted && !breakOutRoomEnded && item.number >= mainRoomsLength) {
      const roomNumber = item.number - (mainRoomsLength - 1);
      if (targetPage + 1 !== roomNumber) {
        if (islevel !== '2') {
          displayItem = (
            <View style={styles.lockContainer}>
              <Text style={styles.pageText}>
                Room {roomNumber}
              </Text>
              <FontAwesome name="lock" size={16} style={styles.lockIcon} />
            </View>
          );
        } else {
          displayItem = (
            <Text style={styles.pageText}>
              Room {roomNumber}
            </Text>
          );
        }
      } else {
        displayItem = (
          <Text style={styles.pageText}>
            Room {roomNumber}
          </Text>
        );
      }
    } else {
      // Wrap item.number in a Text component to avoid the error
      displayItem = <Text style={styles.pageText}>{item.number}</Text>;
  }

    return (
      <Pressable
        key={item.id}
        style={[styles.pageButton, pageStyle]}
        onPress={() => onPagePress(item.number)}
        accessibilityRole="button"
        accessibilityLabel={`Page ${item.number === 0 ? 'Star' : item.number}`}
      >
        {item.number === 0 ? (
          <FontAwesome name="star" size={18} color={isActive ? 'yellow' : 'gray'} />
        ) : (
          displayItem
        )}
      </Pressable>
    );
  };

  /**
   * Determines the alignment styles based on position and location props.
   *
   * @returns StyleProp<ViewStyle> - The alignment style object.
   */
  const getAlignmentStyle = (): StyleProp<ViewStyle> => {
    const alignmentStyle: StyleProp<ViewStyle> = {};

    switch (position) {
      case 'left':
        alignmentStyle.justifyContent = 'flex-start';
        break;
      case 'right':
        alignmentStyle.justifyContent = 'flex-end';
        break;
      case 'middle':
      default:
        alignmentStyle.justifyContent = 'center';
        break;
    }

    switch (location) {
      case 'top':
        alignmentStyle.alignItems = 'flex-start';
        break;
      case 'bottom':
        alignmentStyle.alignItems = 'flex-end';
        break;
      case 'middle':
      default:
        alignmentStyle.alignItems = 'center';
        break;
    }

    return alignmentStyle;
  };

  const dimensions = {
    width: direction === 'horizontal' ? 0 : paginationHeight,
    height: direction === 'horizontal' ? paginationHeight : 0,
  };

  const defaultContent = (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      horizontal={direction === 'horizontal'}
      renderItem={renderItem}
      contentContainerStyle={[
        styles.paginationContainer,
        { backgroundColor },
          getAlignmentStyle(),
        { flexDirection: direction === 'vertical' ? 'column' : 'row' },
        { justifyContent: 'space-evenly' },
      ]}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={{ 
        display: showAspect ? 'flex' : 'none',
        padding: 0,
        margin: 0,
        width: direction === "horizontal" ? "100%" : paginationHeight,
        height: direction === "horizontal" ? paginationHeight : "100%",
        maxHeight: direction === "horizontal" ? paginationHeight : "100%",
        maxWidth: direction === "horizontal" ? "100%" : paginationHeight,
        ...style as any,
       }}
    />
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  return renderContainer 
    ? (renderContainer({ defaultContainer: content, dimensions }) as JSX.Element)
    : content as JSX.Element;

};

export default Pagination;

/**
 * Stylesheet for the Pagination component.
 */
const styles = StyleSheet.create({
  paginationContainer: {
    flexGrow: 1,
    padding: 0,
    margin: 0
  },
  pageButton: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#2c678f',
    marginHorizontal: 5,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePage: {
    backgroundColor: '#2c678f',
    borderColor: '#2c678f',
  },
  inactivePage: {
    backgroundColor: '#ffffff',
    borderColor: '#2c678f',
  },
  pageText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1.2,
  },
  lockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    marginLeft: 2,
    color: '#000000',
  },
});

// MenuItemComponent.tsx

import React from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; 

/**
 * Props for the MenuItemComponent.
 */
export interface MenuItemComponentOptions {
  /**
   * The name of the FontAwesome5 icon to be displayed.
   */
  icon?: string;

  /**
   * The text to be displayed as the menu item name.
   */
  name?: string;

  /**
   * The function to be called when the menu item is pressed.
   */
  onPress: () => void;
}

/**
 * MenuItemComponent renders a menu item with an optional icon and text.
 *
 * @component
 * @param {MenuItemComponentOptions} props - The properties for the MenuItemComponent.
 * @returns {JSX.Element} The rendered MenuItemComponent.
 *
 * MenuItemComponent renders a menu item with an optional icon and text.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { MenuItemComponent } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *   return (
 *     <MenuItemComponent
 *       icon="bars"
 *       name="Menu"
 *       onPress={() => console.log('Menu pressed')}
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const MenuItemComponent: React.FC<MenuItemComponentOptions> = ({ icon, name, onPress }) => (
  <Pressable
    style={styles.listItem}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={name || 'Menu Item'}
  >
    {icon && <FontAwesome5 name={icon} style={styles.listIcon} />}
    {name && <Text style={styles.listText}>{name}</Text>}
  </Pressable>
);

export default MenuItemComponent;

/**
 * Stylesheet for the MenuItemComponent.
 */
const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 16,
    paddingLeft: 0,
    marginLeft: 0,
    marginBottom: 10,

  },

  listIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#ffffff',
  },

  listText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

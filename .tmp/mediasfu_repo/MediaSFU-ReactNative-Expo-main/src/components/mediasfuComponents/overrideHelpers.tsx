/**
 * Override helper utilities for MediaSFU React Native Expo
 * 
 * These utilities enable flexible component and function overrides
 * while maintaining React Native compatibility (no DOM APIs).
 */

import { ComponentType, ReactNode } from 'react';

/**
 * Component override type - supports both full replacement and render wrapping
 */
export interface CustomComponentOverride<Props> {
  /**
   * Completely replace the default component
   */
  component?: ComponentType<Props>;
  
  /**
   * Wrap or augment the default component's render
   */
  render?: (props: Props) => ReactNode;
}

/**
 * Function override type - supports both full replacement and wrapping
 */
export interface CustomFunctionOverride<Fn extends (...args: any[]) => any> {
  /**
   * Completely replace the default implementation
   */
  implementation?: Fn;
  
  /**
   * Wrap the default implementation (before/after logic)
   */
  wrap?: (defaultImplementation: Fn) => Fn;
}

/**
 * Applies a component override, returning the appropriate component to render
 * 
 * @param override - The override configuration (component or render function)
 * @param DefaultComponent - The default component to use if no override is provided
 * @returns The component to render (either overridden or default)
 * 
 * @example
 * ```tsx
 * const MyComponent = withOverride(
 *   uiOverrides?.mainContainer,
 *   MainContainerComponent
 * );
 * 
 * // Later in JSX:
 * <MyComponent {...props} />
 * ```
 */
export function withOverride<Props>(
  override: CustomComponentOverride<Props> | undefined,
  DefaultComponent: ComponentType<Props>
): ComponentType<Props> {
  // If no override provided, return default
  if (!override) {
    return DefaultComponent;
  }

  // If component replacement provided, use it
  if (override.component) {
    return override.component;
  }

  // If render function provided, create a wrapper component
  if (override.render) {
    return ((props: Props) => override.render!(props)) as ComponentType<Props>;
  }

  // Fallback to default
  return DefaultComponent;
}

/**
 * Applies a function override, returning the appropriate function to use
 * 
 * @param override - The override configuration (implementation or wrap function)
 * @param defaultFn - The default function to use if no override is provided
 * @returns The function to use (either overridden or default)
 * 
 * @example
 * ```tsx
 * const customConsumerResume = withFunctionOverride(
 *   uiOverrides?.consumerResume,
 *   consumerResume
 * );
 * 
 * // Later in code:
 * await customConsumerResume(params);
 * ```
 * 
 * @example
 * // Wrapping with analytics
 * ```tsx
 * const override = {
 *   wrap: (original) => async (params) => {
 *     const start = performance.now();
 *     const result = await original(params);
 *     analytics.track('consumer_resume', {
 *       duration: performance.now() - start,
 *       consumerId: params?.consumer?.id
 *     });
 *     return result;
 *   }
 * };
 * ```
 */
export function withFunctionOverride<Fn extends (...args: any[]) => any>(
  override: CustomFunctionOverride<Fn> | undefined,
  defaultFn: Fn
): Fn {
  // If no override provided, return default
  if (!override) {
    return defaultFn;
  }

  // If implementation replacement provided, use it
  if (override.implementation) {
    return override.implementation;
  }

  // If wrap function provided, apply it
  if (override.wrap) {
    return override.wrap(defaultFn);
  }

  // Fallback to default
  return defaultFn;
}

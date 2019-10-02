'use strict';
import React from 'react';
import { createPortal } from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import styled, { keyframes } from 'styled-components';
import { antialiased } from '../../styles/helpers';
import { themeVal } from '../../styles/utils/general';
import { multiply } from '../../styles/utils/math';

const bounceAnim = keyframes`
  0%,
  80%,
  100% { 
    transform: scale(0);
  }

  40% { 
    transform: scale(1.0);
  }
`;

const Spinner = styled.div`
  font-size: 0;
  border-radius: ${themeVal('shape.rounded')};
  padding: ${themeVal('layout.space')} ${multiply(themeVal('layout.space'), 2)};
`;

const LoadingPane = styled.div`
  ${antialiased()}
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9997;
  cursor: not-allowed;
  background: rgba(255,255,255,0.32);
  display: flex;
  justify-content: center;
  align-items: center;

  &.loading-pane-enter {
    transform: translate3d(0, 0, 0);
    transition: opacity 0.32s ease 0s, visibility 0.32s linear 0s;
    opacity: 0;
    visibility: hidden;
  }

  &.loading-pane-enter-active {
    opacity: 1;
    visibility: visible;
  }

  &.loading-pane-exit {
    transition: opacity 0.32s ease 0s, visibility 0.32s linear 0s;
    opacity: 1;
    visibility: visible;
  }

  &.loading-pane-exit-active {
    opacity: 0;
    visibility: hidden;
  }
`;

const LoadingPaneInner = styled.div`
  border-radius: ${themeVal('shape.rounded')};
  background: #fff;
  padding: ${multiply(themeVal('layout.space'), 2)};
  box-shadow: 0 0 0 ${themeVal('layout.border')} ${themeVal('color.shadow')};
  text-align: center;
`;

const Bounce = styled.div`
  width: 1rem;
  height: 1rem;
  background: ${themeVal('type.base.color')};
  border-radius: ${themeVal('shape.ellipsoid')};
  display: inline-block;
  margin: 0 0.5rem;
  animation: ${bounceAnim} 1.4s infinite ease-in-out both;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }
  
  /* Animation delays */
  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
`;

// Minimum time the loading is visible.
const MIN_TIME = 512;
// Since we have a minimum display time we use a timeout to hide it if
// when the hide method is called the time isn't over yet. However, if in
// the mean time the loading is shown again we need to clear the timeout.
let hideTimeout = null;

// Once the component is mounted we store it to be able to access it from
// the outside.
let theGlobalLoading = null;

// Store the amount of global loading calls so we can keep it visible until
// all were hidden.
let theGlobalLoadingCount = 0;

export default class GlobalLoading extends React.Component {
  constructor (props) {
    super(props);
    this.componentAddedBodyClass = false;

    this.state = {
      showTimestamp: 0, // eslint-disable-line
      message: '', // eslint-disable-line
      revealed: false
    };
  }

  componentDidMount () {
    if (theGlobalLoading !== null) {
      throw new Error('<GlobalLoading /> component was already mounted. Only 1 is allowed.');
    }
    theGlobalLoading = this;
    const { revealed } = this.state;
    this.toggleBodyClass(revealed);
  }

  componentDidUpdate () {
    const { revealed } = this.state;
    this.toggleBodyClass(revealed);
  }

  componentWillUnmount () {
    this.toggleBodyClass(false);
    theGlobalLoading = null;
  }

  toggleBodyClass (revealed) {
    const bd = document.getElementsByTagName('body')[0]; // eslint-disable-line
    if (revealed) {
      this.componentAddedBodyClass = true;
      bd.classList.add('unscrollable-y');
    } else if (this.componentAddedBodyClass) {
      // Only act if the class was added by this component.
      this.componentAddedBodyClass = false;
      bd.classList.remove('unscrollable-y');
    }
  }

  render () {
    const { revealed, message } = this.state;

    return createPortal((
      <CSSTransition
        in={revealed}
        unmountOnExit
        appear
        classNames='loading-pane'
        timeout={{ enter: 300, exit: 300 }}
      >

        <LoadingPane>
          <LoadingPaneInner>
            <Spinner>
              <Bounce />
              <Bounce />
              <Bounce />
            </Spinner>
            {message && <p>{message}</p>}
          </LoadingPaneInner>
        </LoadingPane>

      </CSSTransition>
    ), document.body);  // eslint-disable-line
  }
}

/**
 * Show a global loading.
 * The loading has a minimum visible time defined by the MIN_TIME constant.
 * This will prevent flickers in the interface when the action is very fast.
 * @param  {Number} count Define how many loadings to show. This will not
 *                        show multiple loadings on the page but will increment
 *                        a counter. This is helpful when there are many actions
 *                        that require a loading.
 *                        The global loading will only be dismissed once all
 *                        counters shown are hidden.
 *                        Each function call will increment the counter.
 *                        Default 1
 * @param {boolean} force Sets the count to the given value without incrementing
 *
 * @example
 * showGlobalLoading()
 * // Counter set to 1
 * showGlobalLoading(3)
 * // Counter set to 4
 * hideGlobalLoading()
 * // Counter is now 3
 * hideGlobalLoading(3)
 * // Counter is now 0 and the loading is dismissed.
 */
export function showGlobalLoading (count = 1, force = false, message = '') {
  if (theGlobalLoading === null) {
    throw new Error('<GlobalLoading /> component not mounted');
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }

  theGlobalLoadingCount = force
    ? count
    : theGlobalLoadingCount + count;

  theGlobalLoading.setState({
    showTimestamp: Date.now(),
    revealed: true,
    message
  });
}

export function showGlobalLoadingMessage (message, count = 1, force = false) {
  return showGlobalLoading(count, force, message);
}

/**
 * Hides a global loading
 * @param  {Number} count Define how many loadings to hide. Using 0 or any
 *                        negative number will immediately dismiss the loading
 *                        without waiting for the minimum display time.
 *                        Default 1
 * @param {boolean} force Sets the count to the given value without decrementing
 * @param {function} cb   Callback called after the loading is hidden.
 *
 * @example
 * showGlobalLoading()
 * // Counter set to 1
 * showGlobalLoading(3)
 * // Counter set to 4
 * hideGlobalLoading()
 * // Counter is now 3
 * hideGlobalLoading(3)
 * // Counter is now 0 and the loading is dismissed.
 */
export function hideGlobalLoading (count = 1, force = false, cb = () => {}) {
  if (theGlobalLoading === null) {
    throw new Error('<GlobalLoading /> component not mounted');
  }

  if (typeof count === 'function') {
    cb = count; // eslint-disable-line
    count = 1; // eslint-disable-line
  }
  const hide = () => { theGlobalLoading.setState({ revealed: false }); cb(); };

  // Using 0 or negative numbers results in the loading being
  // immediately dismissed.
  if (count < 1) {
    theGlobalLoadingCount = 0;
    return hide();
  }

  // Decrement counter by given amount without going below 0.
  theGlobalLoadingCount = force
    ? count
    : theGlobalLoadingCount - count;
  if (theGlobalLoadingCount < 0) theGlobalLoadingCount = 0;

  const time = theGlobalLoading.state.showTimestamp;
  const diff = Date.now() - time;
  if (diff >= MIN_TIME) {
    if (theGlobalLoadingCount === 0) return hide();
  } else {
    hideTimeout = setTimeout(() => {
      if (theGlobalLoadingCount === 0) return hide();
    }, MIN_TIME - diff);
  }
}

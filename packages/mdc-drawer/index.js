/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {MDCComponent} from '@material/base/index';
import MDCDismissibleDrawerFoundation from './dismissible/foundation';
import MDCModalDrawerFoundation from './modal/foundation';
import {MDCList} from '@material/list/index';
import MDCListFoundation from '@material/list/foundation';
import {strings} from './constants';
import * as util from './util';

/**
 * @extends {MDCComponent<!MDCDismissibleDrawerFoundation>}
 * @final
 */
export class MDCDrawer extends MDCComponent {
  /**
   * @param {...?} args
   */
  constructor(...args) {
    super(...args);

    /** @private {!Element} */
    this.previousFocus_;

    /** @private {!Function} */
    this.handleKeydown_;

    /** @private {!Function} */
    this.handleTransitionEnd_;

    /** @private {!Function} */
    this.handleScrimClick_;
  }

  /**
   * @param {!Element} root
   * @return {!MDCDrawer}
   */
  static attachTo(root) {
    return new MDCDrawer(root);
  }

  /**
   * Returns true if drawer is in the open position.
   * @return {boolean}
   */
  get open() {
    return this.foundation_.isOpen();
  }

  /**
   * Toggles the drawer open and closed.
   * @param {boolean} isOpen
   */
  set open(isOpen) {
    if (isOpen) {
      this.foundation_.open();
    } else {
      this.foundation_.close();
    }
  }

  initialize() {
    const list = MDCList.attachTo(this.root_.querySelector(`.${MDCListFoundation.cssClasses.ROOT}`));
    list.singleSelection = true;
  }

  initialSyncWithDOM() {
    const {MODAL} = MDCDismissibleDrawerFoundation.cssClasses;

    if (this.root_.classList.contains(MODAL)) {
      const {SCRIM_SELECTOR} = MDCDismissibleDrawerFoundation.strings;
      this.scrim_ = this.root_.parentElement.querySelector(SCRIM_SELECTOR);
      this.handleScrimClick_ = () => this.foundation_.handleScrimClick();
      this.scrim_.addEventListener('click', this.handleScrimClick_);
      this.focusTrap_ = util.createFocusTrapInstance(this.root_);
    }

    this.handleKeydown_ = (evt) => this.foundation_.handleKeydown(evt);
    this.handleTransitionEnd_ = (evt) => this.foundation_.handleTransitionEnd(evt);

    this.root_.addEventListener('keydown', this.handleKeydown_);
    this.root_.addEventListener('transitionend', this.handleTransitionEnd_);
  }

  destroy() {
    this.root_.removeEventListener('keydown', this.handleKeydown_);
    this.root_.removeEventListener('transitionend', this.handleTransitionEnd_);

    const {MODAL} = MDCDismissibleDrawerFoundation.cssClasses;
    if (this.root_.classList.contains(MODAL)) {
      this.scrim_.removeEventListener('click', this.handleScrimClick_);
      this.focusTrap_.destroy();
    }
  }

  getDefaultFoundation() {
    /** @type {!MDCDrawerAdapter} */
    const adapter = /** @type {!MDCDrawerAdapter} */ (Object.assign({
      addClass: (className) => this.root_.classList.add(className),
      removeClass: (className) => this.root_.classList.remove(className),
      hasClass: (className) => this.root_.classList.contains(className),
      elementHasClass: (element, className) => element.classList.contains(className),
      computeBoundingRect: () => this.root_.getBoundingClientRect(),
      saveFocus: () => {
        this.previousFocus_ = document.activeElement;
      },
      restoreFocus: () => {
        const previousFocus = this.previousFocus_ && this.previousFocus_.focus;
        if (this.root_.contains(document.activeElement) && previousFocus) {
          this.previousFocus_.focus();
        }
      },
      focusActiveNavigationItem: () => {
        const activeNavItemEl = this.root_.querySelector(strings.ACTIVE_NAV_ITEM_SELECTOR);
        if (activeNavItemEl) {
          activeNavItemEl.focus();
        }
      },
      notifyClose: () => this.emit(strings.CLOSE_EVENT, null, true /* shouldBubble */),
      notifyOpen: () => this.emit(strings.OPEN_EVENT, null, true /* shouldBubble */),
      trapFocus: () => this.focusTrap_.activate(),
      untrapFocus: () => this.focusTrap_.deactivate(),
    }));

    const {DISMISSIBLE, MODAL} = MDCDismissibleDrawerFoundation.cssClasses;
    if (this.root_.classList.contains(DISMISSIBLE)) {
      return new MDCDismissibleDrawerFoundation(adapter);
    } else if (this.root_.classList.contains(MODAL)) {
      return new MDCModalDrawerFoundation(adapter);
    }
  }
}

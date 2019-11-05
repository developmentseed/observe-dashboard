import React from 'react';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';

import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody,
  InpageBodyInner
} from '../common/Inpage';
import Prose from '../../styles/type/prose';

export default class Photos extends React.Component {
  render () {
    return (
      <App pageTitle='Photos'>
        <Inpage>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Photos</InpageTitle>
              </InpageHeadline>
            </InpageHeaderInner>
          </InpageHeader>
          <InpageBody>
            <InpageBodyInner>
              <Prose>
                <p>
                  Dolor pariatur ullamco ex anim velit ut amet excepteur. Ex
                  magna amet proident pariatur nulla quis Lorem irure. Ut elit
                  mollit cillum sint. Consectetur ut non anim tempor anim
                  proident consequat incididunt ipsum.
                </p>
              </Prose>
            </InpageBodyInner>
          </InpageBody>
        </Inpage>
      </App>
    );
  }
}

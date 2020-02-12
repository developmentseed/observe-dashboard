import React from 'react';

import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody,
  InpageBodyInner
} from '../common/inpage';
import Prose from '../../styles/type/prose';

export default class About extends React.Component {
  render () {
    return (
      <App pageTitle='About'>
        <Inpage>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>About</InpageTitle>
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

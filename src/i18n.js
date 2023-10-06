import React, { Component } from 'react';
import { node } from 'prop-types';
import queryString from 'query-string';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import ja from 'react-intl/locale-data/ja';
import enUS from './locale/en_US';
import zhTW from './locale/zh_TW';
import jaJP from './locale/ja_JP';

addLocaleData([...en, ...zh, ...ja]);

class I18n extends Component {
  get locale () {
    const { lang } = queryString.parse(window.location.search);
    if (lang) {
      return lang;
    }
    return navigator.language;
  }

  get messages () {
    if (this.locale === 'zh-TW') {
      return zhTW;
    } else if (this.locale === 'ja-JP') {
      return jaJP;
    }
    return enUS;
  }

  render () {
    return (
      <IntlProvider
        locale={this.locale}
        messages={this.messages}
        onError={err => console.warn(err)}
      >
        {this.props.children}
      </IntlProvider>
    );
  }
}

I18n.propTypes = {
  children: node.isRequired,
};

export default I18n;

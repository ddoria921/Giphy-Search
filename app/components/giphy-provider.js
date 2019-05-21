import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import fetch from 'fetch';
import config from 'giphy-search/config/environment';

export default Component.extend({
  //-- Component Params --//
  endpoint: null,
  options: null,
  type: 'fixed',

  //-- Internal State --//
  results: null,
  _lastRawResults: null,
  _lastType: 'fixed_width',

  //-- Computed Properties --//
  apiEndpoint: computed('endpoint', function() {
    switch (this.endpoint) {
      case 'search':
        return 'search';
      case 'trending':
      default:
        return 'trending';
    }
  }),

  gifType: computed('type', function() {
    switch (this.type) {
      case 'fixed-small':
        return 'fixed_width_small_still';
      case 'downsized':
        return 'downsized';
      case 'fixed':
      default:
        return 'fixed_width';
    }
  }),

  // -- Lifecycle --//
  didReceiveAttrs() {
    this._super(...arguments);

    if (this.gifType !== this._lastType && this._lastRawResults) {
      const newResults = this._lastRawResults.map(gif => this.imageWithGifTitle(gif));
      this.set('results', newResults);
    } else {
      this.fetchGifs.perform();
    }

    this.set('_lastType', this.gifType);
  },

  // -- Tasks --//
  fetchGifs: task(function*() {
    let results = [];

    // throttle number of searches
    yield timeout(200);

    try {
      const response = yield fetch(this.buildUrl());
      const { data } = yield response.json();

      this.set('_lastRawResults', data);
      results = data.map(gif => this.imageWithGifTitle(gif));
    } catch (error) {
      console.error(error);
    }

    this.set('results', results);
  }).restartable(),

  // -- Helper methods --//
  imageWithGifTitle(gif) {
    return Object.assign({ title: gif.title }, gif.images[this.gifType]);
  },

  convertToQueryString(options) {
    let queryString = '';

    if (options) {
      Object.keys(options).forEach(key => {
        if (queryString.length !== 0) {
          queryString += '&';
        }

        queryString += `${encodeURIComponent(key)}=${encodeURIComponent(
          options[key]
        )}`;
      });
    }

    return queryString;
  },

  buildUrl() {
    const { apiEndpoint, options } = this;
    const serializedOptions = this.convertToQueryString(options);
    let url = `https://api.giphy.com/v1/gifs/${apiEndpoint}?api_key=${
      config.APP.GIPHY_API_KEY
    }`;

    if (serializedOptions) {
      url += `&${serializedOptions}`;
    }

    return url;
  }
});

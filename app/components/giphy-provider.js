import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import fetch from 'fetch';
import config from 'giphy-search/config/environment';

export default Component.extend({
  //-- Component Params --//
  endpoint: null,
  options: null,
  type: 'fixed',

  //-- Internal State --//
  results: null,

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
    this.fetchGifs.perform();
  },

  // -- Tasks --//
  fetchGifs: task(function*() {
    let results = [];

    try {
      const response = yield fetch(this.buildUrl());
      const { data } = yield response.json();

      results = data.map(gif => {
        return Object.assign({ title: gif.title }, gif.images[this.gifType]);
      });
    } catch (error) {
      console.error(error);
    }

    this.set('results', results);
  }).keepLatest(),

  // -- Helper methods --//
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
    let url = `http://api.giphy.com/v1/gifs/${apiEndpoint}?api_key=${
      config.APP.GIPHY_API_KEY
    }`;

    if (serializedOptions) {
      url += `&${serializedOptions}`;
    }

    return url;
  }
});

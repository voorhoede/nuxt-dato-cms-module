import { subscribeToQuery } from 'datocms-listen';
import Vue from 'vue';
import fetch from 'node-fetch';

const PUBLISHED_ENDPOINT = 'https://graphql.datocms.com/';
const LISTEN_ENDPOINT = 'https://graphql-listen.datocms.com/';

const vm = new Vue({
  data: {
    error: null,
    status: 'connecting',
  },
});

type Unsubscribes = { [key: string]: Function }

/**
 * @type {import('@nuxt/types').Plugin}
 */
export default ({ app }, inject) => {
  let unsubscribes: Unsubscribes = {};

  app.router.afterEach(() => {
    Object.values(unsubscribes).forEach((unsubscribe) => unsubscribe());
    unsubscribes = {};
  });

  // This store is explicitly used for dato previews.
  // It's state should only be read.
  // The state shouldn't be mutated from outside this plugin,
  // so that's why I'm using a local store here,
  // instead of adding a separate store module.

  return inject('dato', {
    state: vm,

    /**
     * Query published endpoint
     * @param {{ query: string, variables: object }}
     * @returns {promise<object>} query response
     */
    async query({ query, variables = {} }) {
      const response = await fetch(PUBLISHED_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ query, variables }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer <%= options.datoReadOnlyToken %>',
        },
      });

      const body = await response.json() as { data?: object, errors?: object[] };

      if (body?.errors) {
        throw body.errors;
      }

      if (!body?.data) {
        throw new Error('Empty response');
      }

      return body.data;
    },

    /**
     * Subscribe to changes on query when in preview mode.
     * `onData` is called with query response data on changes.
     * On route changes, query is automatically unsubscribed.
     * @param {({ query: string, variables?: object, onData: function }) => function}
     * @returns {function} function to unsubscribe.
     */
    async subscribeToQueryInPreviewMode({ query, variables = {}, onData }) {
      // app.context.$preview is the preview data.
      // It's an object in preview mode, and undefined when not in preview mode.
      if (!app.context.$preview) {
        return () => {};
      }

      const unsubscribe = await subscribeToQuery({
        baseUrl: LISTEN_ENDPOINT,
        token: '<%= options.datoReadOnlyToken %>',
        query,
        variables,
        preview: true,
        onUpdate: (update) => {
          onData(update.response.data);
        },
        onStatusChange(status) {
          vm.status = status;
        },
        onChannelError(error) {
          vm.error = error;
        },
      });

      const unsubscribeKey = `${query}.${JSON.stringify(variables)}`;
      unsubscribes[unsubscribeKey] = unsubscribe;

      return () => {
        unsubscribe();
        delete unsubscribes[unsubscribeKey];
      };
    },
  });
};

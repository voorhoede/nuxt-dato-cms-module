const STORAGE_KEY = 'nuxt-datocms-preview-data';

/**
 * @type {import('@nuxt/types').Plugin}
 */
export default function (
  {
    enablePreview,
    query,
    route,
    redirect,
    error,
  },
  inject
) {
  const { preview, previewSecret, ...otherQueryParams } = query;

  // Feature check for Local Storage API
  // @see https://mathiasbynens.be/notes/localstorage-pattern
  const storage = (() => {
    // eslint-disable-next-line new-parens
    const uid = new Date;
    let storage;
    let result;

    try {
      (storage = window.localStorage).setItem(uid, uid);
      // eslint-disable-next-line eqeqeq
      result = storage.getItem(uid) == uid;
      storage.removeItem(uid);
      return result && storage;
    } catch (exception) { }
  })();

  inject('nuxtDatoCms', {
    enter: enterPreview,
    exit: exitPreview,
  });

  if (storage && storage.getItem(STORAGE_KEY)) {
    const data = JSON.parse(storage.getItem(STORAGE_KEY));

    if (preview || previewSecret) {
      removePreviewQueryParams();
    }

    return enterPreview(data);
  }

  if (preview !== 'true') {
    // Not in preview mode, so we don't need to do anything.
    return;
  }

  // lodash templating of plugin options passed by module.
  if (previewSecret !== '<%= options.previewSecret %>') {
    return onReady(() => error({
      statusCode: 401,
      message: 'Invalid secret.',
    }));
  }

  enterPreview();

  return onReady(removePreviewQueryParams);

  function enterPreview (data = {}) {
    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    enablePreview(data);
  }

  function exitPreview () {
    if (storage) {
      storage.removeItem(STORAGE_KEY);
    }
    window.location.reload();
  }

  function removePreviewQueryParams() {
    const routeWithoutPreviewQueryParams = {
      ...route,
      query: otherQueryParams
    };
    redirect(routeWithoutPreviewQueryParams);
  }

  // The `window.onNuxtReady(fn)` are needed to avoid hydration issues:
  // @see https://github.com/nuxt/nuxt.js/issues/4491#issuecomment-648979464
  function onReady(fn) {
    window.onNuxtReady(() => fn());
  };
}

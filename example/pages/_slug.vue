<template>
  <div>
    <h1>{{ page.title }}</h1>
    <nuxt-link to="/">Back to home</nuxt-link>
  </div>
</template>

<script>
const query = `
  query ($slug: String) {
    page(filter: {
      slug: {
        eq: $slug
      }
    }) {
      title
    }
  }
`;

export default {
  asyncData({ $dato, route }) {
    return $dato.query({
      query,
      variables: {
        slug: route.params.slug,
      },
    });
  },
  async mounted() {
    const unsubscribe = await this.$dato.subscribeToQueryInPreviewMode({
      query,
      variables: {
        slug: this.$route.params.slug,
      },
      onData: (data) => {
        this.page = data.page;
      },
    });

    setTimeout(() => unsubscribe(), 1000);
  },
};
</script>

<template>
  <h1>{{ page.title }}</h1>
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
`

export default {
  asyncData({ $dato, route }) {
    return $dato.query({ query, variables: {
      slug: route.params.slug
    }});
  },
  mounted() {
    this.$dato.subscribeToQueryInPreviewMode({
      query,
      variables: {
        slug: this.$route.params.slug
      },
      onData: (data) => this.page = data.page,
    });
  },
}
</script>

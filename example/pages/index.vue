<template>
  <div>
    <h1>{{ page.title }}</h1>
    <nav>
      <ul>
        <li
          v-for="otherPage in otherPages"
          :key="otherPage.slug"
        >
          <nuxt-link
            :to="{ name: 'slug', params: { slug: otherPage.slug } }"
          >{{ otherPage.title }}</nuxt-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
  const query = `
    query {
      page: home {
        title
      },
      otherPages: allPages {
        slug
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

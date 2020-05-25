<template>
  <b-container fluid="lg">
    <b-row
      v-for="(experienceRows, rowIndex) in experiences"
      :key="rowIndex"
      class="justify-content-sm-start"
      align-v="start"
    >
      <b-card-group deck>
        <b-card
          v-for="(experience, index) in experienceRows"
          :key="index"
          :title="experience.title"
          :sub-title="getSubTitle(experience)"
          img-src="https://picsum.photos/600/300/?image=25"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="mb-2"
        >
          <b-card-text class="card-subtitle text-info">
            {{ experience.role }}
          </b-card-text>
          <b-card-text>
            <b-badge
              v-for="(tag, tagIndex) in experience.technology"
              :key="tagIndex"
              variant="secondary"
              style="margin-left: 5px;"
              >{{ tag }}</b-badge
            >
          </b-card-text>
          <b-card-text>
            <b-icon-circle size="small" /> Experience one fksfjsfsjfd sdkflsjfd
            sdfksfdj sdfklsjfjsfdjsfsjfd</b-card-text
          >
          <b-card-text>
            <b-icon-circle /> Experience Two sldkfsfd sdfklskdfsdf sfdkslfdsklfd
            sfdlksklf;dsk;fld</b-card-text
          >

          <template v-slot:footer>
            <b-link :href="experience.url" class="card-link">
              <b-icon icon="link45deg"></b-icon> Web</b-link
            >
          </template>
          <!--<b-button href="#" variant="primary">Go somewhere</b-button>-->
        </b-card>
      </b-card-group>
    </b-row>
  </b-container>
</template>
<script>
import work from "./../../data/work.json";
export default {
  data() {
    const rows = [];
    work.experience.forEach((item, index) => {
      if (index % 3 == 0) {
        rows.push(work.experience.slice(index, index + 3));
      }
    });
    return {
      experiences: rows,
    };
  },
  methods: {
    getSubTitle(experience) {
      return (
        experience.location +
        " (" +
        experience.start +
        " - " +
        experience.end +
        " )"
      );
    },
  },
};
</script>

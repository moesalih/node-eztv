/* eslint import/no-named-as-default-member: off */
import EZTV from '..';

jest.setTimeout(10000);

// @TODO
// Remove properties from results that will change over time.
// This makes snapshotting the results possible
// function removeDynamicProperties(obj) {
//   delete obj.episodeTitle
//   delete obj.torrentURL
// }

describe('EZTV', () => {
  it('should get shows list', async () => {
    const [firstShow] = await EZTV.getShows();
    expect(firstShow).toMatchSnapshot();
  });

  it('should get shows with query param', async () => {
    const show = await EZTV.getShows({ query: 'sherlock' });
    expect(show).toMatchSnapshot();
  });

  it('should error when show episodes queried with no arg', async () => {
    try {
      await EZTV.getShowEpisodes();
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });

  it('should get show episodes', async () => {
    const episodes = await EZTV.getShowEpisodes(376, 'sherlock');
    const [firstEpisode] = episodes.episodes;
    expect(firstEpisode).toMatchSnapshot();
  });
});

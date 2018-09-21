import EZTV from '..';

describe('EZTV', () => {
  it('should get shows', async () => {
    expect(await EZTV.getShows({ query: 'sherlock' })).toMatchSnapshot();
  });

  it('should get show episodes', async () => {
    expect(await EZTV.getShowEpisodes({ query: 'sherlock' })).toMatchSnapshot();
  });
});

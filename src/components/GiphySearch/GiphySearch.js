import React from 'react';
// hooks
import usePrevious from './utils/usePrevious';
// api
import searchGif from './utils/searchGif';
// styles
import './GiphySearch.css';

const parseGif = data => ({
  id: data.id,
  alt: data.title,
  url: data.images.fixed_height.url,
  previewUrl: data.images.preview_gif.url
});

const cbSetData = (parsedData, offset) => prevData => {
  if (offset > 0) return [...prevData, ...parsedData];
  else return parsedData;
};

const GiphySearch = (props) => {
  const {
    lang,
    query,
    limit,
    rating,
    onSelect,
    randomId,
    className
  } = props;

  const divRef = React.useRef();
  const prevQuery = usePrevious(query);

  const [data, setData] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [offset, setOffset] = React.useState(0);
  const [isFetching, setIsFetching] = React.useState(false);

  const handleReset = () => {
    setData([]);
    setTotal(0);
    setOffset(0);
  };

  React.useEffect(() => {
    if (!query || (query && offset > 0 && prevQuery !== query)) {
      handleReset();
    } else if (query) {
      setIsFetching(true);

      const options = { limit, offset };
      if (lang) options.lang = lang;
      if (rating) options.rating = rating;
      if (randomId) options.random_id = randomId;
      // TO DO: improve
      if (offset === 0 && divRef.current) divRef.current.scrollTo({ top: 0 });

      searchGif(query, options)
        .then(response => {
          const parsedData = response.data.map(parseGif);
          setData(cbSetData(parsedData, offset));
          setTotal(response.pagination.total_count);
        })
        .finally(() => setIsFetching(false));
    }
  }, [query, limit, lang, rating, randomId, offset]);

  const handleLoadMore = React.useCallback(() => {
    if (!isFetching) setOffset(offset => offset + limit);
  }, [limit, isFetching]);

  const handleSelect = gif => () => onSelect(gif);

  return (
    <div
      ref={divRef}
      className={`giphy-search__container ${!!query ? 'open': ''} ${className}`}
    >
      {
        query && data.length ?
          <ul className="results-container">
            {data.map(gif => (
              <li key={gif.id} className="result-item">
                <img
                  width="150px"
                  height="150px"
                  alt={gif.alt}
                  src={gif.previewUrl}
                  onClick={handleSelect(gif)}
                />
              </li>
            ))}
          </ul> :
          <GiftsNotFound
            query={query}
            isFetching={isFetching}
          />
      }

      <ButtonLoadMore
        total={total}
        isFetching={isFetching}
        dataLength={data.length}
        handleLoadMore={handleLoadMore}
      />
    </div>
  );
};

const GiftsNotFound = (props) => {
  const { query, isFetching } = props;

  if (isFetching) return null;

  return (
    <div className="not-found font-size-24 padding-24">
      No gifs were found for <strong>{`'${query}'`}</strong> ;(!
    </div>
  );
};

const ButtonLoadMore = (props) => {
  const {
    total,
    isFetching,
    dataLength,
    handleLoadMore
  } = props;

  if (total <= dataLength) return null;

  return (
    <button
      type="button"
      disabled={isFetching}
      className="load-more"
      onClick={handleLoadMore}
    >
      Load More
    </button>
  );
};

export default GiphySearch;

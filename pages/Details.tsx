import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getImageUrl, getPosterUrl, getStillUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { MovieDetails, TvDetails, SeasonDetails, Episode } from '../types';
import TvButton from '../components/TvButton';
import { Play, Plus, Check, Star, Calendar, Clock, Layers, Tv } from 'lucide-react';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<MovieDetails | TvDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  
  // TV Specific State
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  const mediaType = (type as 'movie' | 'tv') || 'movie';

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.getDetails(id, mediaType);
        if (typeof data.id === 'string') data.id = parseInt(data.id);
        (data as any).media_type = mediaType;
        
        setContent(data);
        setInWatchlist(watchlistService.isInWatchlist(data.id));

        // If it's a TV show, try to set initial season
        if (mediaType === 'tv' && 'seasons' in data && data.seasons && data.seasons.length > 0) {
            // Find the first season that isn't season 0 (specials), unless that's all there is
            const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
            setSelectedSeasonNumber(firstSeason.season_number);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, mediaType]);

  // Fetch Season Details when selected season changes
  useEffect(() => {
    const fetchSeason = async () => {
      if (mediaType !== 'tv' || !content || !id) return;
      
      setLoadingSeason(true);
      try {
        const data = await api.getSeasonDetails(parseInt(id), selectedSeasonNumber);
        setSeasonDetails(data);
      } catch (e) {
        console.error("Failed to load season", e);
      } finally {
        setLoadingSeason(false);
      }
    };

    fetchSeason();
  }, [selectedSeasonNumber, content?.id, mediaType]);

  useEffect(() => {
    const handleUpdate = () => {
      if (content) setInWatchlist(watchlistService.isInWatchlist(content.id));
    };
    window.addEventListener('watchlist-updated', handleUpdate);
    return () => window.removeEventListener('watchlist-updated', handleUpdate);
  }, [content]);

  useEffect(() => {
    if (!loading && content) {
        const playBtn = document.getElementById('details-play-btn');
        if (playBtn) playBtn.focus();
    }
  }, [loading, content]);

  const toggleWatchlist = () => {
    if (content) {
      watchlistService.toggleWatchlist(content as any);
    }
  };

  const playEpisode = (season: number, episode: number) => {
    if (!content) return;
    navigate(`/watch/${content.id}?type=tv&s=${season}&e=${episode}`);
  };

  if (loading || !content) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
       <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Normalize fields
  const title = 'title' in content ? content.title : content.name;
  const releaseDate = 'release_date' in content ? content.release_date : content.first_air_date;
  const runtime = 'runtime' in content ? content.runtime : (content.episode_run_time?.[0] || 0);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden">
      {/* Full screen backdrop with heavy gradient overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src={getImageUrl(content.backdrop_path)} 
          alt={title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen px-12 md:px-20 pt-24 pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Poster & Actions */}
          <div className="w-full lg:w-1/4 flex flex-col gap-8">
            <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 aspect-[2/3]">
              <img 
                src={getPosterUrl(content.poster_path)} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex flex-col gap-4">
               <TvButton 
                id="details-play-btn"
                variant="primary" 
                icon={<Play fill="currentColor" />}
                className="w-full justify-center"
                onClick={() => {
                  if (mediaType === 'tv') {
                      playEpisode(selectedSeasonNumber, 1);
                  } else {
                      navigate(`/watch/${content.id}?type=movie`);
                  }
                }}
              >
                {mediaType === 'movie' ? 'Watch Movie' : `Start Season ${selectedSeasonNumber}`}
              </TvButton>
              <TvButton 
                variant={inWatchlist ? "secondary" : "glass"}
                icon={inWatchlist ? <Check /> : <Plus />}
                className="w-full justify-center"
                onClick={toggleWatchlist}
              >
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </TvButton>
            </div>
          </div>

          {/* Right Column: Info & Content */}
          <div className="w-full lg:w-3/4 flex flex-col">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-300 text-lg mb-8">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500" fill="currentColor" size={20} />
                  <span className="font-bold text-white">{content.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>{releaseDate ? releaseDate.split('-')[0] : 'N/A'}</span>
                </div>
                
                {mediaType === 'movie' ? (
                  <div className="flex items-center gap-2">
                    <Clock size={20} />
                    <span>{runtime}m</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Layers size={20} />
                    <span>{(content as TvDetails).number_of_seasons} Seasons</span>
                  </div>
                )}

                {content.genres.map(g => (
                  <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                    {g.name}
                  </span>
                ))}
              </div>

              {content.tagline && (
                <p className="text-xl text-gray-400 italic mb-6">"{content.tagline}"</p>
              )}

              <p className="text-lg md:text-xl leading-relaxed text-gray-200 mb-10 max-w-4xl">
                {content.overview}
              </p>

              {/* Cast Row */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-6 text-white/90">Top Cast</h3>
                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                  {content.credits.cast.slice(0, 8).map(person => (
                    <div key={person.id} className="flex flex-col items-center w-24 text-center flex-shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border border-white/20">
                        {person.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">No Image</div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-200 line-clamp-1">{person.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TV Show Seasons & Episodes Section */}
              {mediaType === 'tv' && (content as TvDetails).seasons && (
                <div className="mt-4">
                  <h3 className="text-3xl font-bold mb-6 text-white">Episodes</h3>
                  
                  {/* Season Selectors */}
                  <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 py-2">
                    {(content as TvDetails).seasons.map((season) => (
                      <button
                        key={season.id}
                        onClick={() => setSelectedSeasonNumber(season.season_number)}
                        className={`focusable tv-focus flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all ${
                          selectedSeasonNumber === season.season_number 
                            ? 'bg-red-600 text-white' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {season.name}
                      </button>
                    ))}
                  </div>

                  {/* Episodes List */}
                  <div className="flex flex-col gap-4">
                    {loadingSeason ? (
                       <div className="flex justify-center py-12">
                         <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       </div>
                    ) : seasonDetails?.episodes ? (
                      seasonDetails.episodes.map((episode) => (
                        <div 
                          key={episode.id}
                          className="focusable tv-focus group flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent focus:border-white"
                          onClick={() => playEpisode(episode.season_number, episode.episode_number)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') playEpisode(episode.season_number, episode.episode_number);
                          }}
                        >
                          {/* Episode Thumbnail */}
                          <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden flex-shrink-0 relative">
                             {episode.still_path ? (
                               <img 
                                 src={getStillUrl(episode.still_path)} 
                                 alt={episode.name}
                                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                               />
                             ) : (
                               <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                 <Tv size={32} className="text-gray-600" />
                               </div>
                             )}
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                  <Play fill="white" size={24} />
                                </div>
                             </div>
                          </div>

                          {/* Episode Info */}
                          <div className="flex flex-col justify-center flex-grow">
                             <div className="flex items-baseline gap-3 mb-1">
                               <span className="text-red-500 font-bold text-lg">E{episode.episode_number}</span>
                               <h4 className="text-xl font-semibold text-white group-focus:text-yellow-400 transition-colors">{episode.name}</h4>
                             </div>
                             
                             <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                               <span>{episode.runtime ? `${episode.runtime} min` : 'N/A'}</span>
                               <span>{episode.air_date}</span>
                               <div className="flex items-center gap-1">
                                  <Star size={12} className="text-yellow-500" fill="currentColor" />
                                  <span>{episode.vote_average.toFixed(1)}</span>
                               </div>
                             </div>

                             <p className="text-gray-300 text-sm line-clamp-2">{episode.overview}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 py-8">No episodes available for this season.</div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
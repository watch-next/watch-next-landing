/**
 * Person Mapper
 *
 * Pure functions that transform TMDB cast/crew responses into domain models.
 *
 * Responsibilities:
 * - Map TmdbCastMember → Person (domain model)
 * - Map TmdbCrewMember → Person (domain model)
 * - Compose profile image URLs
 * - No side effects, no external dependencies
 */

import { buildImageUrl } from '../config';
import type { TmdbCastMember, TmdbCrewMember } from '../types';

/**
 * Domain model for a Person (actor, director, crew).
 */
export interface Person {
  id: number;
  name: string;
  profileUrl: string;
  character?: string;
  job?: string;
  department?: string;
  order?: number;
}

/**
 * Map a TMDB cast member to the domain Person model.
 * @param castMember Raw TMDB cast response
 * @param imageSize Image size (default: w185)
 */
export function mapTmdbCastMemberToPerson(
  castMember: TmdbCastMember,
  imageSize: string = 'w185'
): Person {
  return {
    id: castMember.id,
    name: castMember.name,
    profileUrl: buildImageUrl(castMember.profile_path, imageSize),
    character: castMember.character,
    order: castMember.order,
  };
}

/**
 * Map a TMDB crew member to the domain Person model.
 * @param crewMember Raw TMDB crew response
 * @param imageSize Image size (default: w185)
 */
export function mapTmdbCrewMemberToPerson(
  crewMember: TmdbCrewMember,
  imageSize: string = 'w185'
): Person {
  return {
    id: crewMember.id,
    name: crewMember.name,
    profileUrl: buildImageUrl(crewMember.profile_path, imageSize),
    job: crewMember.job,
    department: crewMember.department,
  };
}

/**
 * Map a batch of TMDB cast members to domain models.
 */
export function mapTmdbCastMembersToPeople(
  castMembers: TmdbCastMember[],
  imageSize?: string
): Person[] {
  return castMembers.map(member =>
    mapTmdbCastMemberToPerson(member, imageSize)
  );
}

/**
 * Map a batch of TMDB crew members to domain models.
 */
export function mapTmdbCrewMembersToPeople(
  crewMembers: TmdbCrewMember[],
  imageSize?: string
): Person[] {
  return crewMembers.map(member =>
    mapTmdbCrewMemberToPerson(member, imageSize)
  );
}

/**
 * Extract key crew members (director, writer, producer) from credits.
 */
export function extractKeyCrew(credits: { crew: TmdbCrewMember[] }): {
  director?: string;
  writer?: string;
  producer?: string;
} {
  const result: { director?: string; writer?: string; producer?: string } = {};

  const director = credits.crew.find(
    m => m.department === 'Directing' && m.job === 'Director'
  );
  if (director) {
    result.director = director.name;
  }

  const writer = credits.crew.find(
    m => m.department === 'Writing' && ['Writer', 'Screenplay', 'Story'].includes(m.job)
  );
  if (writer) {
    result.writer = writer.name;
  }

  const producer = credits.crew.find(
    m => m.department === 'Production' && m.job === 'Producer'
  );
  if (producer) {
    result.producer = producer.name;
  }

  return result;
}
module Types
  module Serializer
    ID = Types::String.meta(example: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX")
    URL = Types::String.meta(example: "http://some-website.com")
    Meta = Types::Hash.schema(partial: Types::Bool)
    Email = Types::String.meta(example: "me@email.com")

    Pointer = Types::Hash.schema(id: ID, type: Types::String)
    Collection = Types::Hash.schema(data: Types::Array.of(Pointer))
    Resource = Types::Hash.schema(data: Pointer.optional)

    NotificationPreference = Types::String.enum("always", "never", "daily")

    Abilities = Types::Hash.schema(
      create: Types::Bool,
      read: Types::Bool,
      update: Types::Bool,
      delete: Types::Bool
    )

    Attachment = Types::Hash.schema(
      small: URL.optional,
      small_square: URL.optional,
      small_landscape: URL.optional,
      small_portrait: URL.optional,
      medium: URL.optional,
      medium_square: URL.optional,
      medium_landscape: URL.optional,
      medium_portrait: URL.optional,
      large_landscape: URL.optional,
      original: URL.optional
    )

    Upload = Types::Hash.schema(
      filename: Types::String.meta(example: "profile_pic.png"),
      data: Types::String.meta(
        description: "A base 64 encoded image string",
        example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
      ),
      content_type: Types::String.meta(example: "image/png")
    )

    PersistentUI = Types::Hash.schema(
      reader: Types::Hash.schema(
        colors: Types::Hash.schema(
          color_scheme: Types::String.enum("light", "dark")
        ),
        typography: Types::Hash.schema(
          font: Types::String.meta(example: "serif"),
          margins: Types::Hash.schema(
            max: Types::Integer,
            min: Types::Integer,
            current: Types::Integer
          ),
          font_size: Types::Hash.schema(
            max: Types::Integer,
            min: Types::Integer,
            current: Types::Integer
          )
        ),
        reading_groups: Types::Hash.schema(
          current_reading_group: Types::Serializer::ID
        )
      )
    )

    NotificationPreferences = Types::Hash.schema(
      projects: Types::String.enum("never", "always"),
      followedProjects: Types::String.enum("never", "always"),
      flaggedResources: Types::String.enum("never", "always"),
      projectCommentsAndAnnotations: Types::String.enum("never", "always"),
      repliesToMe: Types::String.enum("never", "always"),
      digest: Types::String.enum("never", "always"),
      digestCommentsAndAnnotations: Types::String.enum("never", "always")
    )
  end
end

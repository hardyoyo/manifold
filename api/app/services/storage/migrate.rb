module Storage
  class Migrate

    class << self

      def migrate_store_to_mirror
        shrine_properties.each do |klass_name, properties|
          klass = klass_name.to_s.constantize
          klass.find_each do |model|
            Rails.logger.info "Mirroring #{klass_name} #{model.id}..."
            properties.each do |property|
              attacher = model.send("#{property}_attacher")
              next unless attacher.stored?

              attacher.file.trigger_mirror_upload

              # if using derivatives
              next unless attacher.respond_to? :derivatives

              attacher.map_derivative(attacher.derivatives) do |_, derivative|
                derivative.trigger_mirror_upload
              end
            end
          end
        end
      end

      # TODO: Find a better way to track these.
      def shrine_properties
        {
          ActionCallout: [:attachment],
          Feature: [:background, :foreground],
          IngestionSource: [:attachment],
          Ingestion: [:source],
          Maker: [:avatar],
          Project: [:cover, :hero, :avatar],
          User: [:avatar],
          ProjectCollection: [:custom_icon, :hero, :social_image],
          ResourceCollection: [:thumbnail],
          ResourceImport: [:data],
          Resource: [
            :attachment,
            :high_res,
            :transcript,
            :translation,
            :variant_format_one,
            :variant_format_two,
            :variant_thumbnail,
            :variant_poster
          ],
          Settings: [:press_logo, :press_logo_footer, :press_logo_mobile, :favicon],
          Text: [:cover],
          CachedExternalSource: [:asset],
          ProjectExport: [:asset],
          TextExport: [:asset]
        }
      end

    end

  end
end

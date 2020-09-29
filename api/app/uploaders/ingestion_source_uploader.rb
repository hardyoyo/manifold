# @see IngestionSource
class IngestionSourceUploader < Shrine
  include SharedUploader

  plugin :pretty_location
  plugin :determine_mime_type, analyzer: BETTER_MARCEL
  plugin :validation_helpers
  plugin :backgrounding

  Attacher.destroy_block do
    Attachments::DestroyAttachmentJob.perform_later(self.class.name, data)
  end

  Attacher.validate do
    validations = MANIFOLD_CONFIG.attachments.validations

    validate_mime_type_inclusion validations.resource.allowed_mime
    validate_extension_inclusion validations.resource.allowed_ext
  end
end

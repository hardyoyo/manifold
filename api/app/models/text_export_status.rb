class TextExportStatus < ApplicationRecord
  include Concerns::ExportStatusView

  configure!
end

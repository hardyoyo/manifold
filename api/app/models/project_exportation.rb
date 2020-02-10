# The intention to export a {Project} (via {ProjectExport}) to an {ExportTarget}.
#
# @see ProjectExportationTransition
# @see ProjectExportations::StateMachine
class ProjectExportation < ApplicationRecord
  include Authority::Abilities
  include Concerns::HasStateMachine
  include Concerns::SerializedAbilitiesFor
  include Filterable

  belongs_to :project, required: true
  belongs_to :export_target, required: true
  belongs_to :project_export, optional: true
  belongs_to :user, optional: true

  has_state_machine! initial_state: :pending

  validates :project_export, presence: true, on: %i[export_ready success]

  scope :by_created_at, lambda { |order = nil|
    return order(created_at: :desc) if order.nil?

    order(created_at: order)
  }

  # @return [ExportStrategies::Selection]
  def to_selection
    raise "Not selectable" unless export_ready? || success?

    ExportStrategies::Selection.new self, project_export, export_target
  end
end

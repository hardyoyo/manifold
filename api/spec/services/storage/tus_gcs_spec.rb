require 'rails_helper'
require 'HTTP'

RSpec.describe Storage::TusGcs do

  before(:all) {
    Settings.instance.update_from_environment!
  }

  before(:each) {
    WebMock.allow_net_connect!
  }

  let(:bucket) { "manifold-local-dev-primary" }
  let(:credentials) { ::Factory::DriveSession.config }
  let(:gcs) { Storage::TusGcs.new(bucket: bucket, credentials: credentials ) }

  describe "#initialize" do
    it "accepts bucket" do
      expect(gcs.bucket).to eq bucket
    end
  end

  describe "#create" do
    it "creates new empty file" do
      gcs.create_file("the-unique-file-id", info = {})
      expect(gcs.get_file("the-unique-file-id").each.to_a.join).to eq ""
    end
  end

  describe "#concatenate" do
    it "creates a new file which is a concatenation of given parts" do
      gcs.create_file("a")
      gcs.patch_file("a", StringIO.new("hello"))
      gcs.create_file("b")
      gcs.patch_file("b", StringIO.new(" world"))
      gcs.concatenate("ab", ["a", "b"])
      expect(gcs.get_file("ab").each.to_a.join).to eq "hello world"
    end

    it "deletes concatenated files" do
      gcs.create_file("a")
      gcs.create_file("b")
      gcs.concatenate("ab", ["a", "b"])
      expect{
        gcs.read_info("a")
      }.to raise_error(Tus::NotFound)
      expect{
        gcs.read_info("b")
      }.to raise_error(Tus::NotFound)
    end

    it "raises an error when parts are missing" do
      assert_raises(Tus::Error) {gcs.concatenate("ab", ["a", "b"]) }
    end
  end

  describe "#patch_file" do
    it "appends to the file" do
      gcs.create_file("foo")
      gcs.patch_file("foo", StringIO.new("hello"))
      gcs.patch_file("foo", StringIO.new(" world"))
      expect(gcs.get_file("foo").each.to_a.join).to eq "hello world"
    end

    it "returns the number of bytes copied" do
      gcs.create_file("foo")
      expect(gcs.patch_file("foo", StringIO.new("hello"))).to eq 5
      expect(gcs.patch_file("foo", StringIO.new(" world"))).to eq 6
    end

    it "works with Tus::Input" do
      gcs.create_file("foo")
      gcs.patch_file("foo", Tus::Input.new(StringIO.new("hello")))
      gcs.patch_file("foo", Tus::Input.new(StringIO.new(" world")))
      expect(gcs.get_file("foo").each.to_a.join).to eq "hello world"
    end
  end

  describe "#read_info" do
    it "retrieves the info" do
      gcs.create_file("foo")
      expect(gcs.read_info("foo")).to eq({})
      gcs.update_info("foo", { "Foo" => "Bar" })
      expect(gcs.read_info("foo")).to eq({ "Foo" => "Bar" })
    end
  end

  describe "#update_info" do
    it "updates the info" do
      gcs.create_file("foo")
      gcs.update_info("foo", { "bar" => "baz" })
      gcs.update_info("foo", { "quux" => "quilt" })
      expect(gcs.read_info("foo")).to eq({ "quux" => "quilt" })
    end
  end

  describe "#get_file" do
    let(:contents) { "a" * 16 * 1024 + "b" * 16 * 1024 }

    it "returns chunked response" do
      gcs.create_file("foo")
      gcs.patch_file("foo", StringIO.new(contents))
      response = gcs.get_file("foo")
      expect(contents).to eq response.each.to_a.join
      response.close
    end

    it "supports partial responses" do
      gcs.create_file("foo")
      gcs.patch_file("foo", StringIO.new(contents))

      response = gcs.get_file("foo", range: (16 * 1024 - 3)..(16 * 1024 + 2) )
      expect(response.each.to_a.join).to eq("a" * 3 + "b" * 3)

      response = gcs.get_file("foo", range: (16 * 1024 - 3)..(32 * 1024 - 1))
      expect(response.each.to_a.join).to eq("a" * 3 + "b" * 16 * 1024)

      response = gcs.get_file("foo", range: (0)..(16 * 1024 + 2))
      expect(response.each.to_a.join).to eq("a" * 16 * 1024 + "b" * 3)
    end

    it "handles multibyte characters" do
      gcs.create_file("foo")
      gcs.patch_file("foo", StringIO.new("😃"))
    end
  end

  describe "#delete_file" do
    it "deletes files from the filesystem" do
      gcs.create_file("foo")
      gcs.update_info("foo", {"bar" => "baz"})
      expect(gcs.exists?("foo")).to be true
      expect(gcs.info_exists?("foo")).to be true
      gcs.delete_file("foo")
      expect(gcs.exists?("foo")).to be false
      expect(gcs.info_exists?("foo")).to be false
    end

    it "doesn't raise an error if file is missing" do
      gcs.delete_file("not-a-real-file")
    end
  end

  describe "#expire_files" do
    # TODO
  end

end

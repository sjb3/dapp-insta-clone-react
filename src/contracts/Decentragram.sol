pragma solidity ^0.5.0;

contract Decentragram {
  string public name = 'Decentragram';

  // Store images
  uint public imageCount = 0;
  mapping(uint => Image) public images;

  struct Image {
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }

  event ImageCreated (
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

    event ImageTipped (
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  // Create images
  function uploadImage(string memory _imageHash, string memory _description) public {
    require(bytes(_description).length > 0, 'Require image description');
    require(bytes(_imageHash).length > 0, 'Require image image hash');
    require(msg.sender != address(0x0), 'Require image sender');

    // Increment image id
    imageCount ++;

    // Add image to contract
    images[imageCount] = Image(imageCount, _imageHash, _description, 0, msg.sender);

    emit ImageCreated(imageCount, _imageHash, _description, 0, msg.sender);
  }

  // Tip images
  function tipImageOwner(uint _id) public payable {
    require(_id > 0 && _id <= imageCount);

    // Fetch the image
    Image memory _image = images[_id];
    // Fetch the author
    address payable _author = _image.author;
    // Pay the author by sending eth
    address(_author).transfer(msg.value);
    // Increment the tip amount
    _image.tipAmount = _image.tipAmount + msg.value;
    // UPdate the image
    images[_id] = _image;

    emit ImageTipped(_id, _image.hash, _image.description, _image.tipAmount, _author);
  }
 }
import socket


def is_port_available(port):
    """Return True if the UDP port is available (i.e. can be bound), else False."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.bind(('0.0.0.0', port))
        return True
    except OSError:
        return False
    finally:
        sock.close()


def find_longest_contiguous_range(start, end):
    """
    Iterates from start to end and returns the longest contiguous block 
    of available ports as a tuple (block_start, block_end, block_length).
    """
    longest_start = None
    longest_end = None
    longest_length = 0

    current_start = None
    current_length = 0

    for port in range(start, end + 1):
        if is_port_available(port):
            if current_start is None:
                current_start = port
                current_length = 1
            else:
                current_length += 1
        else:
            # End of current available block; check if it is the longest so far.
            if current_length > longest_length:
                longest_length = current_length
                longest_start = current_start
                longest_end = port - 1
            # Reset current block
            current_start = None
            current_length = 0

    # In case the longest block is at the very end of the range.
    if current_length > longest_length:
        longest_length = current_length
        longest_start = current_start
        longest_end = end

    return longest_start, longest_end, longest_length


def main():
    # These values are typically set in macOS for ephemeral ports:
    ephemeral_start = 49152
    ephemeral_end = 65535

    print(f"Checking UDP ports from {ephemeral_start} to {ephemeral_end}...")
    block_start, block_end, block_length = find_longest_contiguous_range(
        ephemeral_start, ephemeral_end)

    if block_start is not None:
        print(
            f"Longest available contiguous range: {block_start} - {block_end} ({block_length} ports)")
    else:
        print("No available contiguous range found.")


if __name__ == '__main__':
    main()
